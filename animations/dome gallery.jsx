import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGesture } from '@use-gesture/react';

const DEFAULT_IMAGES = [
    { src: '/PIC1.jpg', alt: 'Gallery Image 1' },
    { src: '/PIC2.jpg', alt: 'Gallery Image 2' },
    { src: '/PIC3.JPG', alt: 'Gallery Image 3' },
    { src: '/PIC4.JPG', alt: 'Gallery Image 4' },
    { src: '/PIC5.JPG', alt: 'Gallery Image 5' },
    { src: '/about.jpeg', alt: 'About Image' },

];

const DEFAULTS = {
    maxVerticalRotationDeg: 5,
    dragSensitivity: 20,
    enlargeTransitionMs: 300,
    segments: 35
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => {
    const a = (((deg + 180) % 360) + 360) % 360;
    return a - 180;
};
const getDataNumber = (el, name, fallback) => {
    const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
    const n = attr == null ? NaN : parseFloat(attr);
    return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
    const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
    const evenYs = [-4, -2, 0, 2, 4];
    const oddYs = [-3, -1, 1, 3, 5];

    const coords = xCols.flatMap((x, c) => {
        const ys = c % 2 === 0 ? evenYs : oddYs;
        return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
    });

    const totalSlots = coords.length;
    if (pool.length === 0) {
        return coords.map(c => ({ ...c, src: '', alt: '' }));
    }
    if (pool.length > totalSlots) {
        console.warn(
            `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
        );
    }

    const normalizedImages = pool.map(image => {
        if (typeof image === 'string') {
            return { src: image, alt: '' };
        }
        return { src: image.src || '', alt: image.alt || '' };
    });

    const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

    for (let i = 1; i < usedImages.length; i++) {
        if (usedImages[i].src === usedImages[i - 1].src) {
            for (let j = i + 1; j < usedImages.length; j++) {
                if (usedImages[j].src !== usedImages[i].src) {
                    const tmp = usedImages[i];
                    usedImages[i] = usedImages[j];
                    usedImages[j] = tmp;
                    break;
                }
            }
        }
    }

    return coords.map((c, i) => ({
        ...c,
        src: usedImages[i].src,
        alt: usedImages[i].alt
    }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
    const unit = 360 / segments / 2;
    const rotateY = unit * (offsetX + (sizeX - 1) / 2);
    const rotateX = unit * (offsetY - (sizeY - 1) / 2);
    return { rotateX, rotateY };
}

export default function DomeGallery({
    images = DEFAULT_IMAGES,
    fit = 0.5,
    fitBasis = 'auto',
    minRadius = 600,
    maxRadius = Infinity,
    padFactor = 0.25,
    overlayBlurColor = '#000000',
    maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
    dragSensitivity = DEFAULTS.dragSensitivity,
    enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
    segments = DEFAULTS.segments,
    dragDampening = 2,
    openedImageWidth = '400px',
    openedImageHeight = '400px',
    imageBorderRadius = '30px',
    openedImageBorderRadius = '30px',
    grayscale = true,
    autoRotationSpeed = 0.5
}) {
    const rootRef = useRef(null);
    const mainRef = useRef(null);
    const sphereRef = useRef(null);
    const frameRef = useRef(null);
    const viewerRef = useRef(null);
    const scrimRef = useRef(null);
    const focusedElRef = useRef(null);
    const originalTilePositionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const isMovingRef = useRef(false);
    const moveTimerRef = useRef(null);

    const rotationRef = useRef({ x: 0, y: 0 });
    const observerRef = useRef(null);

    useEffect(() => {
        if (!rootRef.current) return;
        observerRef.current = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );
        observerRef.current.observe(rootRef.current);
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);
    const startRotRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef(null);
    const draggingRef = useRef(false);
    const cancelTapRef = useRef(false);
    const movedRef = useRef(false);
    const inertiaRAF = useRef(null);
    const pointerTypeRef = useRef('mouse');
    const tapTargetRef = useRef(null);
    const openingRef = useRef(false);
    const openStartedAtRef = useRef(0);
    const lastDragEndAt = useRef(0);
    const touchStartRef = useRef(null);

    const scrollLockedRef = useRef(false);
    const lockScroll = useCallback(() => {
        if (scrollLockedRef.current) return;
        scrollLockedRef.current = true;
        document.body.classList.add('dg-scroll-lock');
    }, []);
    const unlockScroll = useCallback(() => {
        if (!scrollLockedRef.current) return;
        if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
        scrollLockedRef.current = false;
        document.body.classList.remove('dg-scroll-lock');
    }, []);

    const items = useMemo(() => buildItems(images, segments), [images, segments]);

    const applyTransform = (xDeg, yDeg) => {
        const el = sphereRef.current;
        if (el) {
            el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
        }
    };

    const lockedRadiusRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const ro = new ResizeObserver(entries => {
            const cr = entries[0].contentRect;
            const w = Math.max(1, cr.width),
                h = Math.max(1, cr.height);
            const minDim = Math.min(w, h),
                maxDim = Math.max(w, h),
                aspect = w / h;
            let basis;
            switch (fitBasis) {
                case 'min':
                    basis = minDim;
                    break;
                case 'max':
                    basis = maxDim;
                    break;
                case 'width':
                    basis = w;
                    break;
                case 'height':
                    basis = h;
                    break;
                default:
                    basis = aspect >= 1.3 ? w : minDim;
            }
            let radius = basis * fit;
            const heightGuard = h * 1.35;
            radius = Math.min(radius, heightGuard);
            radius = clamp(radius, minRadius, maxRadius);
            lockedRadiusRef.current = Math.round(radius);

            const viewerPad = Math.max(8, Math.round(minDim * padFactor));
            root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
            root.style.setProperty('--viewer-pad', `${viewerPad}px`);
            root.style.setProperty('--overlay-blur-color', overlayBlurColor);
            root.style.setProperty('--tile-radius', imageBorderRadius);
            root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
            root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
            applyTransform(rotationRef.current.x, rotationRef.current.y);

            const enlargedOverlay = viewerRef.current?.querySelector('.enlarge');
            if (enlargedOverlay && frameRef.current && mainRef.current) {
                const frameR = frameRef.current.getBoundingClientRect();
                const mainR = mainRef.current.getBoundingClientRect();

                enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
                enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
                enlargedOverlay.style.width = `${frameR.width}px`;
                enlargedOverlay.style.height = `${frameR.height}px`;
            }
        });
        ro.observe(root);
        return () => ro.disconnect();
    }, [
        fit,
        fitBasis,
        minRadius,
        maxRadius,
        padFactor,
        overlayBlurColor,
        grayscale,
        imageBorderRadius,
        openedImageBorderRadius,
        openedImageWidth,
        openedImageHeight
    ]);

    useEffect(() => {
        applyTransform(rotationRef.current.x, rotationRef.current.y);
    }, []);

    const stopInertia = useCallback(() => {
        if (inertiaRAF.current) {
            cancelAnimationFrame(inertiaRAF.current);
            inertiaRAF.current = null;
        }
    }, []);

    const startInertia = useCallback(
        (vx, vy) => {
            const MAX_V = 1.4;
            let vX = clamp(vx, -MAX_V, MAX_V) * 80;
            let vY = clamp(vy, -MAX_V, MAX_V) * 80;
            let frames = 0;
            const d = clamp(dragDampening ?? 0.6, 0, 1);
            const frictionMul = 0.94 + 0.055 * d;
            const stopThreshold = 0.015 - 0.01 * d;
            const maxFrames = Math.round(90 + 270 * d);
            const step = () => {
                vX *= frictionMul;
                vY *= frictionMul;
                if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
                    inertiaRAF.current = null;
                    return;
                }
                if (++frames > maxFrames) {
                    inertiaRAF.current = null;
                    return;
                }
                const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
                const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
                rotationRef.current = { x: nextX, y: nextY };
                applyTransform(nextX, nextY);
                inertiaRAF.current = requestAnimationFrame(step);
            };
            stopInertia();
            inertiaRAF.current = requestAnimationFrame(step);
        },
        [dragDampening, maxVerticalRotationDeg, stopInertia]
    );

    useEffect(() => {
        if (!isVisible) return;
        let frame;
        const autoSpin = () => {
            if (!draggingRef.current && !focusedElRef.current && !isMovingRef.current && autoRotationSpeed !== 0) {
                rotationRef.current.y = wrapAngleSigned(rotationRef.current.y + autoRotationSpeed);
                applyTransform(rotationRef.current.x, rotationRef.current.y);
            }
            frame = requestAnimationFrame(autoSpin);
        };
        frame = requestAnimationFrame(autoSpin);
        return () => cancelAnimationFrame(frame);
    }, [autoRotationSpeed, isVisible]);

    const handleContainerMouseMove = () => {
        isMovingRef.current = true;
        if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
        moveTimerRef.current = setTimeout(() => {
            isMovingRef.current = false;
        }, 1500); // Resume spinning after 1.5s of no movement
    };

    // Mobile touch events are now handled solely by useGesture for dragging
    // Clicking/Tapping is disabled for mobile as requested.

    useGesture(
        {
            onDragStart: ({ event }) => {
                isMovingRef.current = true;
                if (focusedElRef.current) return;
                stopInertia();

                pointerTypeRef.current = event.pointerType || (event.touches ? 'touch' : 'mouse');
                draggingRef.current = true;
                cancelTapRef.current = false;
                movedRef.current = false;
                startRotRef.current = { ...rotationRef.current };
                startPosRef.current = { x: event.clientX ?? (event.touches?.[0]?.clientX), y: event.clientY ?? (event.touches?.[0]?.clientY) };
                const potential = event.target.closest?.('.item__image');
                tapTargetRef.current = potential || null;
            },
            onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
                if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;

                const clientX = event.clientX ?? (event.touches?.[0]?.clientX);
                const clientY = event.clientY ?? (event.touches?.[0]?.clientY);

                const dxTotal = clientX - startPosRef.current.x;
                const dyTotal = clientY - startPosRef.current.y;

                if (!movedRef.current) {
                    const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
                    if (dist2 > 25) movedRef.current = true;
                }

                const nextX = clamp(
                    startRotRef.current.x - dyTotal / dragSensitivity,
                    -maxVerticalRotationDeg,
                    maxVerticalRotationDeg
                );
                const nextY = startRotRef.current.y + dxTotal / dragSensitivity;

                const cur = rotationRef.current;
                if (cur.x !== nextX || cur.y !== nextY) {
                    rotationRef.current = { x: nextX, y: nextY };
                    applyTransform(nextX, nextY);
                }

                if (last) {
                    draggingRef.current = false;
                    let isTap = false;

                    if (startPosRef.current) {
                        const cX = event.clientX ?? (event.changedTouches?.[0]?.clientX);
                        const cY = event.clientY ?? (event.changedTouches?.[0]?.clientY);
                        if (cX != null && cY != null) {
                            const dx = cX - startPosRef.current.x;
                            const dy = cY - startPosRef.current.y;
                            const dist2 = dx * dx + dy * dy;
                            const TAP_THRESH_PX = pointerTypeRef.current === 'touch' ? 15 : 6;
                            if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX) isTap = true;
                        }
                    }

                    let [vMagX, vMagY] = velArr;
                    const [dirX, dirY] = dirArr;
                    let vx = vMagX * dirX;
                    let vy = vMagY * dirY;

                    if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
                        const [mx, my] = movement;
                        vx = (mx / dragSensitivity) * 0.02;
                        vy = (my / dragSensitivity) * 0.02;
                    }

                    if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
                        startInertia(vx, vy);
                    }
                    startPosRef.current = null;
                    cancelTapRef.current = !isTap;

                    // Fire open for all tap events (mouse and touch)
                    if (isTap && tapTargetRef.current && !focusedElRef.current) {
                        openItemFromElement(tapTargetRef.current);
                    }
                    tapTargetRef.current = null;

                    if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
                    if (movedRef.current) lastDragEndAt.current = performance.now();
                    movedRef.current = false;
                    if (pointerTypeRef.current === 'touch') unlockScroll();
                }
            }
        },
        { target: mainRef, eventOptions: { passive: false } }
    );

    useEffect(() => {
        const scrim = scrimRef.current;
        if (!scrim) return;

        const close = () => {
            if (performance.now() - openStartedAtRef.current < 250) return;
            const el = focusedElRef.current;
            if (!el) return;
            const parent = el.parentElement;
            const overlay = viewerRef.current?.querySelector('.enlarge');
            if (!overlay) return;

            const refDiv = parent.querySelector('.item__image--reference');

            const originalPos = originalTilePositionRef.current;
            if (!originalPos) {
                overlay.remove();
                if (refDiv) refDiv.remove();
                parent.style.setProperty('--rot-y-delta', `0deg`);
                parent.style.setProperty('--rot-x-delta', `0deg`);
                el.style.visibility = '';
                el.style.zIndex = 0;
                focusedElRef.current = null;
                rootRef.current?.removeAttribute('data-enlarging');
                openingRef.current = false;
                return;
            }

            const currentRect = overlay.getBoundingClientRect();
            const rootRect = rootRef.current.getBoundingClientRect();

            const originalPosRelativeToRoot = {
                left: originalPos.left - rootRect.left,
                top: originalPos.top - rootRect.top,
                width: originalPos.width,
                height: originalPos.height
            };

            const overlayRelativeToRoot = {
                left: currentRect.left - rootRect.left,
                top: currentRect.top - rootRect.top,
                width: currentRect.width,
                height: currentRect.height
            };

            const animatingOverlay = document.createElement('div');
            animatingOverlay.className = 'enlarge-closing';
            animatingOverlay.style.cssText = `
        position: absolute;
        left: ${overlayRelativeToRoot.left}px;
        top: ${overlayRelativeToRoot.top}px;
        width: ${overlayRelativeToRoot.width}px;
        height: ${overlayRelativeToRoot.height}px;
        z-index: 9999;
        border-radius: ${openedImageBorderRadius};
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,.35);
        transition: all ${enlargeTransitionMs}ms ease-out;
        pointer-events: none;
        margin: 0;
        transform: none;
        filter: ${grayscale ? 'grayscale(1)' : 'none'};
      `;

            const originalImg = overlay.querySelector('img');
            if (originalImg) {
                const img = originalImg.cloneNode();
                img.style.cssText = `width: 100%; height: 100%; object-fit: contain; background: transparent; border-radius: ${openedImageBorderRadius};`;
                animatingOverlay.appendChild(img);
            }

            overlay.remove();
            rootRef.current.appendChild(animatingOverlay);

            void animatingOverlay.getBoundingClientRect();

            requestAnimationFrame(() => {
                animatingOverlay.style.left = originalPosRelativeToRoot.left + 'px';
                animatingOverlay.style.top = originalPosRelativeToRoot.top + 'px';
                animatingOverlay.style.width = originalPosRelativeToRoot.width + 'px';
                animatingOverlay.style.height = originalPosRelativeToRoot.height + 'px';
                animatingOverlay.style.opacity = '0';
            });

            const cleanup = () => {
                animatingOverlay.remove();
                originalTilePositionRef.current = null;

                if (refDiv) refDiv.remove();
                parent.style.transition = 'none';
                el.style.transition = 'none';

                parent.style.setProperty('--rot-y-delta', `0deg`);
                parent.style.setProperty('--rot-x-delta', `0deg`);

                requestAnimationFrame(() => {
                    el.style.visibility = '';
                    el.style.opacity = '0';
                    el.style.zIndex = 0;
                    focusedElRef.current = null;
                    rootRef.current?.removeAttribute('data-enlarging');

                    requestAnimationFrame(() => {
                        parent.style.transition = '';
                        el.style.transition = 'opacity 300ms ease-out';

                        requestAnimationFrame(() => {
                            el.style.opacity = '1';
                            setTimeout(() => {
                                el.style.transition = '';
                                el.style.opacity = '';
                                openingRef.current = false;
                                if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true')
                                    document.body.classList.remove('dg-scroll-lock');
                            }, 300);
                        });
                    });
                });
            };

            animatingOverlay.addEventListener('transitionend', cleanup, {
                once: true
            });
        };

        scrim.addEventListener('click', close);
        const onKey = e => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);

        return () => {
            scrim.removeEventListener('click', close);
            window.removeEventListener('keydown', onKey);
        };
    }, [enlargeTransitionMs, openedImageBorderRadius, grayscale]);

    const openItemFromElement = el => {
        if (openingRef.current) return;
        openingRef.current = true;
        openStartedAtRef.current = performance.now();
        lockScroll();
        const parent = el.parentElement;
        focusedElRef.current = el;
        el.setAttribute('data-focused', 'true');

        // Detect image dimensions to remove excess container
        const originalImg = el.querySelector('img');
        const naturalWidth = originalImg?.naturalWidth || 1920;
        const naturalHeight = originalImg?.naturalHeight || 1080;
        const aspect = naturalWidth / naturalHeight;

        const frame = frameRef.current;
        const mainR = mainRef.current?.getBoundingClientRect();
        if (frame && mainR) {
            const maxW = mainR.width * 0.9;
            const maxH = mainR.height * 0.85;

            let targetW = naturalWidth;
            let targetH = naturalHeight;

            // Scale down if it exceeds maximum width
            if (targetW > maxW) {
                targetW = maxW;
                targetH = targetW / aspect;
            }

            // Scale down if it exceeds maximum height
            if (targetH > maxH) {
                targetH = maxH;
                targetW = targetH * aspect;
            }

            frame.style.width = `${targetW}px`;
            frame.style.height = `${targetH}px`;
        }

        const offsetX = getDataNumber(parent, 'offsetX', 0);
        const offsetY = getDataNumber(parent, 'offsetY', 0);
        const sizeX = getDataNumber(parent, 'sizeX', 2);
        const sizeY = getDataNumber(parent, 'sizeY', 2);

        const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
        const parentY = normalizeAngle(parentRot.rotateY);
        const globalY = normalizeAngle(rotationRef.current.y);
        let rotY = -(parentY + globalY) % 360;
        if (rotY < -180) rotY += 360;
        const rotX = -parentRot.rotateX - rotationRef.current.x;

        parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
        parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

        const refDiv = document.createElement('div');
        refDiv.className = 'item__image item__image--reference opacity-0';
        refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
        parent.appendChild(refDiv);

        void refDiv.offsetHeight;

        const tileR = refDiv.getBoundingClientRect();
        const frameR = frameRef.current?.getBoundingClientRect();
        if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
            openingRef.current = false;
            focusedElRef.current = null;
            parent.removeChild(refDiv);
            unlockScroll();
            return;
        }

        originalTilePositionRef.current = {
            left: tileR.left,
            top: tileR.top,
            width: tileR.width,
            height: tileR.height
        };

        el.style.visibility = 'hidden';
        el.style.zIndex = 0;

        const overlay = document.createElement('div');
        overlay.className = 'enlarge';
        overlay.style.position = 'absolute';
        overlay.style.left = frameR.left - mainR.left + 'px';
        overlay.style.top = frameR.top - mainR.top + 'px';
        overlay.style.width = frameR.width + 'px';
        overlay.style.height = frameR.height + 'px';
        overlay.style.opacity = '0';
        overlay.style.zIndex = '30';
        overlay.style.willChange = 'transform, opacity';
        overlay.style.transformOrigin = 'top left';
        overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;
        overlay.style.borderRadius = openedImageBorderRadius;
        overlay.style.overflow = 'hidden';
        overlay.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)';

        const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
        const rawAlt = parent.dataset.alt || el.querySelector('img')?.alt || '';
        const img = document.createElement('img');
        img.src = rawSrc;
        img.alt = rawAlt;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.background = 'transparent';
        img.style.borderRadius = openedImageBorderRadius;
        img.style.filter = 'none';
        overlay.appendChild(img);
        viewerRef.current.appendChild(overlay);

        const tx0 = tileR.left - frameR.left;
        const ty0 = tileR.top - frameR.top;
        const sx0 = tileR.width / frameR.width;
        const sy0 = tileR.height / frameR.height;

        const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
        const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

        overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

        setTimeout(() => {
            if (!overlay.parentElement) return;
            overlay.style.opacity = '1';
            overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
            rootRef.current?.setAttribute('data-enlarging', 'true');
        }, 16);
    };

    useEffect(() => {
        return () => {
            document.body.classList.remove('dg-scroll-lock');
        };
    }, []);

    const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    
    .sphere-root * {
      box-sizing: border-box;
    }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }
    
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
    }
    
    .sphere-root[data-enlarging="true"] .scrim {
      opacity: 1 !important;
      pointer-events: all !important;
    }
    

    
    // body.dg-scroll-lock {
    //   position: fixed !important;
    //   top: 0;
    //   left: 0;
    //   width: 100% !important;
    //   height: 100% !important;
    //   overflow: hidden !important;
    //   touch-action: none !important;
    //   overscroll-behavior: contain !important;
    // }
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
    .item__image--reference {
      position: absolute;
      inset: 10px;
      pointer-events: none;
    }
  `;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

            <div
                ref={rootRef}
                className="sphere-root relative w-full h-full"
                style={{
                    ['--segments-x']: segments,
                    ['--segments-y']: segments,
                    ['--overlay-blur-color']: overlayBlurColor,
                    ['--tile-radius']: imageBorderRadius,
                    ['--enlarge-radius']: openedImageBorderRadius,
                    ['--image-filter']: grayscale ? 'grayscale(1)' : 'none'
                }}
            >
                <main
                    ref={mainRef}
                    onMouseMove={handleContainerMouseMove}
                    onMouseLeave={() => { isMovingRef.current = false; }}
                    className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
                    style={{
                        touchAction: 'none',
                        WebkitUserSelect: 'none'
                    }}
                >
                    <div className="stage">
                        <div ref={sphereRef} className="sphere">
                            {items.map((it, i) => (
                                <div
                                    key={`${it.x},${it.y},${i}`}
                                    className="sphere-item absolute m-auto"
                                    data-src={it.src}
                                    data-alt={it.alt}
                                    data-offset-x={it.x}
                                    data-offset-y={it.y}
                                    data-size-x={it.sizeX}
                                    data-size-y={it.sizeY}
                                    style={{
                                        ['--offset-x']: it.x,
                                        ['--offset-y']: it.y,
                                        ['--item-size-x']: it.sizeX,
                                        ['--item-size-y']: it.sizeY,
                                        top: '-999px',
                                        bottom: '-999px',
                                        left: '-999px',
                                        right: '-999px'
                                    }}
                                >
                                    <div
                                        className="item__image absolute block overflow-hidden cursor-pointer bg-gray-200 transition-transform duration-300"
                                        role="button"
                                        tabIndex={0}
                                        aria-label={it.alt || 'Open image'}
                                        style={{
                                            inset: '10px',
                                            borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                                            backfaceVisibility: 'hidden'
                                        }}
                                    >
                                        <img
                                            src={it.src}
                                            draggable={false}
                                            alt={it.alt}
                                            className="w-full h-full object-cover pointer-events-none"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                filter: `var(--image-filter, ${grayscale ? 'grayscale(1)' : 'none'})`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="absolute inset-0 m-auto z-[3] pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`
                        }}
                    />

                    <div
                        className="absolute inset-0 m-auto z-[3] pointer-events-none"
                        style={{
                            WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
                            maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
                            backdropFilter: 'blur(3px)'
                        }}
                    />

                    <div
                        className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
                        style={{
                            background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`
                        }}
                    />
                    <div
                        className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
                        style={{
                            background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`
                        }}
                    />

                    <div
                        ref={viewerRef}
                        className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
                        style={{ padding: 'var(--viewer-pad)' }}
                    >
                        <div
                            ref={scrimRef}
                            className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500"
                            style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                backdropFilter: 'blur(3px)'
                            }}
                        />
                        <div
                            ref={frameRef}
                            className="viewer-frame flex"
                            style={{
                                borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})`,
                                width: openedImageWidth || 'min(900px, 95vw)',
                                height: openedImageHeight || 'min(600px, 85vh)',
                                maxWidth: '95vw',
                                maxHeight: '85vh'
                            }}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
