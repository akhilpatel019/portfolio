/**
 * Hero Three.js Kinetic Node Constellation
 * Phase 2 Creative Animation for Akhil Patel Portfolio
 *
 * Features:
 * - Fluid floating particle nodes with proximity line connections
 * - Interactive mouse repulsion & smooth perspective parallax
 * - Dynamic color syncing with Light and Dark modes
 * - Viewport visibility guard via IntersectionObserver (pauses off-screen for 0% idle CPU)
 * - Prefers-reduced-motion accessibility support
 * - Mobile responsive particle density scaling
 * - Graceful WebGL fallback
 */

(function () {
    'use strict';

    // 1. WebGL & Environment Availability Check
    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLAvailable() || typeof THREE === 'undefined') {
        return; // Silent graceful degradation
    }

    // 2. Reduced Motion Preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 3. Canvas & Container Elements
    const canvas = document.getElementById('hero-webgl-canvas');
    const heroLeft = document.querySelector('.hero-left');
    const heroSection = document.querySelector('.hero-section');

    if (!canvas || !heroLeft) {
        return;
    }

    // 4. Color Palette Definitions (Matches root.css variables)
    function getThemeColors() {
        const isDark = document.body.classList.contains('dark-theme');
        return {
            isDark: isDark,
            primary: new THREE.Color(0xd54f2a),       // Terracotta brand accent
            secondary: new THREE.Color(0xdf6a3e),     // Warm copper accent
            ambient: isDark ? new THREE.Color(0xe5e5e5) : new THREE.Color(0xdec8be), // Soft warm champagne in light, crisp white in dark
            maxLineAlpha: isDark ? 0.22 : 0.10
        };
    }

    let colors = getThemeColors();

    // 5. Scene, Camera, and Renderer Setup
    let width = heroLeft.clientWidth;
    let height = heroLeft.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 6. Generate Circular Particle Texture programmatically (Zero external asset dependencies)
    function createCircleTexture() {
        const size = 64;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');

        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(c);
        texture.needsUpdate = true;
        return texture;
    }

    const particleTexture = createCircleTexture();

    // 7. Particle Configuration (Scale by device screen width)
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
    const particleCount = isMobile ? 45 : (isTablet ? 75 : 125);
    const maxDistance = isMobile ? 3.8 : 5.2;

    const xRange = isMobile ? 12 : 22;
    const yRange = isMobile ? 14 : 16;
    const zRange = 10;

    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const nodeColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * xRange * 2;
        positions[i3 + 1] = (Math.random() - 0.5) * yRange * 2;
        positions[i3 + 2] = (Math.random() - 0.5) * zRange;

        // Subtle ambient drift
        velocities.push({
            vx: (Math.random() - 0.5) * 0.012,
            vy: (Math.random() - 0.5) * 0.012,
            vz: (Math.random() - 0.5) * 0.008,
            origX: positions[i3],
            origY: positions[i3 + 1],
            origZ: positions[i3 + 2]
        });

        // 25% primary accent, 15% warm secondary copper, remainder ambient
        const rand = Math.random();
        let c = colors.ambient;
        if (rand < 0.25) c = colors.primary;
        else if (rand < 0.40) c = colors.secondary;

        nodeColors[i3] = c.r;
        nodeColors[i3 + 1] = c.g;
        nodeColors[i3 + 2] = c.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.42 : 0.52,
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: colors.isDark ? 0.8 : 0.45,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 8. Connecting Line Segments Geometry
    const maxConnections = particleCount * 6;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: colors.isDark ? 0.65 : 0.22,
        blending: THREE.NormalBlending,
        depthWrite: false
    });

    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // 9. Interactive Mouse Tracking & Parallax
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let hasPointer = false;

    function onPointerMove(e) {
        if (!heroSection) return;
        const rect = heroSection.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
            hasPointer = true;
            // Normalize coordinates between -1 and 1 relative to hero
            mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // 10. Theme Synchronization Listener
    function updateColorsForTheme() {
        colors = getThemeColors();
        particleMaterial.opacity = colors.isDark ? 0.8 : 0.45;
        lineMaterial.opacity = colors.isDark ? 0.65 : 0.22;
        const colorsAttr = particleGeometry.attributes.color;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const isPrimary = (Math.abs(colorsAttr.array[i3] - colors.primary.r) < 0.08 &&
                               Math.abs(colorsAttr.array[i3 + 1] - colors.primary.g) < 0.08);
            const isSecondary = (Math.abs(colorsAttr.array[i3] - colors.secondary.r) < 0.08 &&
                                 Math.abs(colorsAttr.array[i3 + 1] - colors.secondary.g) < 0.08);
            let c = colors.ambient;
            if (isPrimary) c = colors.primary;
            else if (isSecondary) c = colors.secondary;

            colorsAttr.array[i3] = c.r;
            colorsAttr.array[i3 + 1] = c.g;
            colorsAttr.array[i3 + 2] = c.b;
        }
        colorsAttr.needsUpdate = true;
    }

    // Observer for body class changes (Light/Dark mode toggle)
    const themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.attributeName === 'class') {
                updateColorsForTheme();
                break;
            }
        }
    });
    themeObserver.observe(document.body, { attributes: true });

    // 11. Animation Loop with IntersectionObserver
    let animationFrameId = null;
    let isVisible = true;

    function animate() {
        if (!isVisible) {
            animationFrameId = null;
            return;
        }

        // Smooth mouse parallax lerp
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Subtle camera perspective tilt
        camera.position.x = mouse.x * 1.5;
        camera.position.y = mouse.y * 1.2;
        camera.lookAt(0, 0, 0);

        if (!prefersReducedMotion) {
            const pos = particleGeometry.attributes.position.array;

            // Update particle positions
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const v = velocities[i];

                pos[i3] += v.vx;
                pos[i3 + 1] += v.vy;
                pos[i3 + 2] += v.vz;

                // Bounce off boundaries softly
                if (Math.abs(pos[i3]) > xRange) v.vx *= -1;
                if (Math.abs(pos[i3 + 1]) > yRange) v.vy *= -1;
                if (Math.abs(pos[i3 + 2]) > zRange) v.vz *= -1;

                // Interactive mouse proximity repulsion
                if (hasPointer) {
                    const dx = pos[i3] - mouse.x * xRange * 0.6;
                    const dy = pos[i3 + 1] - mouse.y * yRange * 0.6;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const repulseRadius = 4.5;
                    if (dist < repulseRadius && dist > 0.01) {
                        const force = (repulseRadius - dist) / repulseRadius * 0.04;
                        pos[i3] += (dx / dist) * force;
                        pos[i3 + 1] += (dy / dist) * force;
                    }
                }
            }
            particleGeometry.attributes.position.needsUpdate = true;

            // Connect lines between nearby particles
            let vertexIndex = 0;
            let colorIndex = 0;

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                for (let j = i + 1; j < particleCount; j++) {
                    const j3 = j * 3;
                    const dx = pos[i3] - pos[j3];
                    const dy = pos[i3 + 1] - pos[j3 + 1];
                    const dz = pos[i3 + 2] - pos[j3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < maxDistance && vertexIndex < maxConnections * 6 - 6) {
                        // Position 1
                        linePositions[vertexIndex++] = pos[i3];
                        linePositions[vertexIndex++] = pos[i3 + 1];
                        linePositions[vertexIndex++] = pos[i3 + 2];
                        // Position 2
                        linePositions[vertexIndex++] = pos[j3];
                        linePositions[vertexIndex++] = pos[j3 + 1];
                        linePositions[vertexIndex++] = pos[j3 + 2];

                        if (colors.isDark) {
                            const alpha = (1 - dist / maxDistance) * colors.maxLineAlpha;
                            const r = 0.88 * alpha;
                            const g = 0.88 * alpha;
                            const b = 0.88 * alpha;

                            lineColors[colorIndex++] = r;
                            lineColors[colorIndex++] = g;
                            lineColors[colorIndex++] = b;

                            lineColors[colorIndex++] = r;
                            lineColors[colorIndex++] = g;
                            lineColors[colorIndex++] = b;
                        } else {
                            // Light mode: smoothly fade towards pure background white (1.0) so lines never look black
                            const t = Math.pow(dist / maxDistance, 1.2);
                            const baseR = 0.835, baseG = 0.38, baseB = 0.24; // soft warm terracotta
                            const r = baseR + (1.0 - baseR) * t;
                            const g = baseG + (1.0 - baseG) * t;
                            const b = baseB + (1.0 - baseB) * t;

                            lineColors[colorIndex++] = r;
                            lineColors[colorIndex++] = g;
                            lineColors[colorIndex++] = b;

                            lineColors[colorIndex++] = r;
                            lineColors[colorIndex++] = g;
                            lineColors[colorIndex++] = b;
                        }
                    }
                }
            }

            lineGeometry.setDrawRange(0, vertexIndex / 3);
            lineGeometry.attributes.position.needsUpdate = true;
            lineGeometry.attributes.color.needsUpdate = true;
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    }

    // 12. Visibility Guard: IntersectionObserver
    if ('IntersectionObserver' in window && heroSection) {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isVisible = entry.isIntersecting;
            if (isVisible && !animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        }, { threshold: 0.05 });
        observer.observe(heroSection);
    } else {
        animationFrameId = requestAnimationFrame(animate);
    }

    // 13. Responsive Resize Handler (Debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!heroLeft) return;
            width = heroLeft.clientWidth;
            height = heroLeft.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

            if (!animationFrameId && isVisible) {
                renderer.render(scene, camera);
            }
        }, 120);
    }, { passive: true });

    // Initial render
    if (prefersReducedMotion) {
        renderer.render(scene, camera);
    }
})();
