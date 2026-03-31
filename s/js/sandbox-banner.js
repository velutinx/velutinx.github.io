// Sandbox Mode Banner – shows only when PAYPAL_ENVIRONMENT = 'sandbox'
// It fetches the config from the combined worker, then if sandbox, runs the ticker animation.
// Otherwise, it removes the banner from the DOM.

(function() {
    const WORKER_URL = 'https://paypal-checkout-website.velutinx.workers.dev';

    async function shouldShowBanner() {
        try {
            const res = await fetch(`${WORKER_URL}/api/config`);
            if (!res.ok) return false;
            const config = await res.json();
            return config.environment === 'sandbox';
        } catch (err) {
            console.warn('Failed to fetch config, hiding banner:', err);
            return false; // if config fetch fails, assume live and hide banner
        }
    }

    async function initBanner() {
        const show = await shouldShowBanner();
        const banner = document.querySelector('.sandbox-banner');
        if (!banner) return;

        if (!show) {
            banner.remove(); // remove banner completely
            return;
        }

        // Banner should be shown – run the animation
        const ticker = banner.querySelector('.ticker');
        const messageSpan = banner.querySelector('.text');
        if (!ticker || !messageSpan) return;

        let screenWidth = window.innerWidth;
        let textWidth = messageSpan.offsetWidth;
        let pos = screenWidth;               // start off‑screen right
        const speed = 2.5;
        let isPaused = false;
        let hasPausedThisCycle = false;
        let animationId = null;

        function updateDimensions() {
            screenWidth = window.innerWidth;
            textWidth = messageSpan.offsetWidth;
        }

        function animate() {
            const centerPoint = (screenWidth / 2) - (textWidth / 2);

            if (!isPaused) {
                pos -= speed;
            }

            // Center pause logic
            if (!hasPausedThisCycle && pos <= centerPoint) {
                pos = centerPoint;
                isPaused = true;
                hasPausedThisCycle = true;

                setTimeout(() => {
                    isPaused = false;
                }, 3000);
            }

            // Reset when text completely off left edge
            if (pos <= -textWidth) {
                pos = screenWidth;
                hasPausedThisCycle = false;
            }

            ticker.style.transform = `translateX(${pos}px)`;
            animationId = requestAnimationFrame(animate);
        }

        function onResize() {
            updateDimensions();
            // Reset position to avoid weird state
            pos = screenWidth;
            hasPausedThisCycle = false;
            isPaused = false;
        }

        // Start animation
        updateDimensions();
        animate();

        // Listen for resize
        window.addEventListener('resize', onResize);

        // Optional: stop animation when page is hidden to save resources
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                if (animationId) cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBanner);
    } else {
        initBanner();
    }
})();
