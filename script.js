/* ==========================================================================
   LUNCLIN Studio — interactions
   ========================================================================== */
(function () {
    "use strict";

    const doc = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const mobileNavQuery = window.matchMedia("(max-width: 900px)");

    doc.classList.remove("no-js");
    doc.classList.add("js");

    /* ---------- Header ---------- */
    const header = document.getElementById("siteHeader");

    function updateHeader() {
        if (!header) return;
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    /* ---------- Mobile navigation ---------- */
    const navToggle = document.getElementById("navToggle");
    const primaryNav = document.getElementById("primaryNav");

    function closeNav(returnFocus) {
        if (!header || !navToggle) return;
        header.classList.remove("nav-open");
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Открыть меню");
        if (returnFocus) navToggle.focus();
    }

    if (navToggle && primaryNav && header) {
        navToggle.addEventListener("click", function () {
            const isOpen = header.classList.toggle("nav-open");
            document.body.classList.toggle("nav-open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
            if (isOpen) {
                const firstLink = primaryNav.querySelector("a");
                if (firstLink) firstLink.focus();
            }
        });

        primaryNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                closeNav(false);
            });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && header.classList.contains("nav-open")) {
                closeNav(true);
            }
        });

        document.addEventListener("click", function (event) {
            if (
                header.classList.contains("nav-open") &&
                !header.contains(event.target)
            ) {
                closeNav(false);
            }
        });

        const handleNavViewportChange = function (event) {
            if (!event.matches) closeNav(false);
        };

        if (typeof mobileNavQuery.addEventListener === "function") {
            mobileNavQuery.addEventListener("change", handleNavViewportChange);
        } else if (typeof mobileNavQuery.addListener === "function") {
            mobileNavQuery.addListener(handleNavViewportChange);
        }
    }

    /* ---------- Active navigation link ---------- */
    if (primaryNav && "IntersectionObserver" in window) {
        const navLinks = Array.from(primaryNav.querySelectorAll('a[href^="#"]'));
        const linkById = new Map(
            navLinks.map(function (link) {
                return [link.getAttribute("href").slice(1), link];
            })
        );
        const navSections = Array.from(document.querySelectorAll("main section[id]")).filter(
            function (section) {
                return linkById.has(section.id);
            }
        );

        if (navSections.length) {
            const sectionObserver = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        navLinks.forEach(function (link) {
                            link.classList.remove("is-active");
                            link.removeAttribute("aria-current");
                        });
                        const activeLink = linkById.get(entry.target.id);
                        if (activeLink) {
                            activeLink.classList.add("is-active");
                            activeLink.setAttribute("aria-current", "true");
                        }
                    });
                },
                { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
            );

            navSections.forEach(function (section) {
                sectionObserver.observe(section);
            });
        }
    }

    /* ---------- Fireflies ---------- */
    function createFireflies() {
        const container = document.getElementById("fireflies");
        if (!container || prefersReducedMotion) return;
        if (navigator.connection && navigator.connection.saveData) return;

        const count = window.innerWidth < 640 ? 10 : window.innerWidth < 1100 ? 20 : 34;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i += 1) {
            const firefly = document.createElement("span");
            const size = Math.random() * 3 + 2;
            firefly.className = "firefly";
            if (i % 3 === 0) firefly.classList.add("firefly-green");
            firefly.style.width = size + "px";
            firefly.style.height = size + "px";
            firefly.style.left = Math.random() * 100 + "%";
            firefly.style.bottom = Math.random() * 30 - 25 + "vh";
            firefly.style.setProperty("--fx1", Math.random() * 60 - 30 + "px");
            firefly.style.setProperty("--fx2", Math.random() * 120 - 60 + "px");
            firefly.style.setProperty("--fx3", Math.random() * 60 - 30 + "px");
            firefly.style.setProperty("--fly-dur", Math.random() * 16 + 14 + "s");
            firefly.style.setProperty("--flick-dur", Math.random() * 2.5 + 1.2 + "s");
            firefly.style.animationDelay =
                -Math.random() * 24 + "s, " + -Math.random() * 3 + "s";
            fragment.appendChild(firefly);
        }

        container.appendChild(fragment);
    }

    createFireflies();

    /* Pause ambient animation when the tab is hidden. */
    document.addEventListener("visibilitychange", function () {
        document.body.classList.toggle("is-paused", document.hidden);
    });

    /* ---------- Background parallax (desktop only) ---------- */
    if (!prefersReducedMotion && finePointer && window.innerWidth > 900) {
        const wrap = document.getElementById("bgWrap");
        const deco1 = document.querySelector(".deco-1");
        const deco2 = document.querySelector(".deco-2");
        let ticking = false;

        window.addEventListener(
            "scroll",
            function () {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(function () {
                    const y = window.scrollY;
                    if (wrap) wrap.style.transform = "translateY(" + y * 0.04 + "px)";
                    if (deco1) deco1.style.transform = "translateY(" + y * 0.06 + "px)";
                    if (deco2) deco2.style.transform = "translateY(" + -y * 0.05 + "px)";
                    ticking = false;
                });
            },
            { passive: true }
        );
    }

    /* ---------- Hero word stagger ---------- */
    document.querySelectorAll(".hero h1 .word").forEach(function (word, index) {
        word.style.setProperty("--i", index);
    });

    /* ---------- Scroll reveal ---------- */
    const fadeElements = Array.from(document.querySelectorAll(".fade-up"));

    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.16, rootMargin: "0px 0px -30px 0px" }
        );

        fadeElements.forEach(function (element) {
            revealObserver.observe(element);
        });

        /* Safety net: if something goes wrong, do not leave content hidden. */
        window.setTimeout(function () {
            fadeElements.forEach(function (element) {
                if (!element.classList.contains("is-visible")) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top < window.innerHeight) {
                        element.classList.add("is-visible");
                    }
                }
            });
        }, 2500);
    } else {
        fadeElements.forEach(function (element) {
            element.classList.add("is-visible");
        });
    }

    /* ---------- Subtle pointer tilt on project cards ---------- */
    if (finePointer && !prefersReducedMotion) {
        document.querySelectorAll(".project-card").forEach(function (card) {
            let frame = null;

            card.addEventListener("pointermove", function (event) {
                if (event.pointerType !== "mouse") return;
                if (frame) window.cancelAnimationFrame(frame);
                frame = window.requestAnimationFrame(function () {
                    const rect = card.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width - 0.5;
                    const y = (event.clientY - rect.top) / rect.height - 0.5;
                    card.style.transform =
                        "perspective(900px) rotateX(" +
                        -y * 3.5 +
                        "deg) rotateY(" +
                        x * 4.5 +
                        "deg) translateY(-3px)";
                });
            });

            card.addEventListener("pointerleave", function () {
                if (frame) window.cancelAnimationFrame(frame);
                card.style.transform = "";
            });
        });
    }

    /* ---------- Project dialog ---------- */
    const projects = {
        up: {
            title: "UP!",
            status: "Концепт",
            platform: "Unity",
            image: "UP.webp",
            imageAlt: "Концепт игры UP! — аркадный паркур",
            description:
                "Аркадный only-up паркур в стиле low-poly. Поднимайся выше, не падай вниз и доберись до финала — каждая ошибка стоит прогресса.",
            quote: "«Иногда вверх — единственное направление.»"
        },
        market: {
            title: "Market",
            status: "Концепт",
            platform: "Unity",
            image: "Market.webp",
            imageAlt: "Концепт игры Market — магазин и воришки",
            description:
                "Не дай местным воришкам обокрасть твой магазин. Следи за прилавком, раскрывай кражи и продержись до закрытия.",
            quote: "«Не пойман — не вор.»"
        },
        church: {
            title: "The Church of Silence",
            status: "Концепт",
            platform: "Roblox",
            image: "The Church of Silence.webp",
            imageAlt: "Концепт игры The Church of Silence",
            description:
                "Survival horror, где вы исследуете подозрительную церковь и пытаетесь понять, что скрывается за тишиной.",
            quote: "«Тишина в церкви — не всегда благодать.»"
        },
        traitor: {
            title: "Recognize The Traitor",
            status: "Концепт",
            platform: "Roblox",
            image: "Recognize The Traitor.webp",
            imageAlt: "Концепт игры Recognize The Traitor",
            description:
                "Все игроки одинаковы. Вычисли убийцу по поведению, пока он не добрался до тебя.",
            quote: "«Среди одинаковых всегда есть один другой.»"
        }
    };

    const dialog = document.getElementById("projectDialog");

    if (dialog && typeof dialog.showModal === "function") {
        const dialogTitle = document.getElementById("dialogTitle");
        const dialogDescription = document.getElementById("dialogDescription");
        const dialogQuote = document.getElementById("dialogQuote");
        const dialogTags = document.getElementById("dialogTags");
        const dialogImage = document.getElementById("dialogImage");

        function openProject(project) {
            if (!project) return;
            dialogTitle.textContent = project.title;
            dialogDescription.textContent = project.description;
            dialogQuote.textContent = project.quote;
            dialogImage.src = project.image;
            dialogImage.alt = project.imageAlt;
            dialogTags.innerHTML =
                '<span class="badge status">' +
                project.status +
                '</span><span class="badge platform">' +
                project.platform +
                "</span>";
            dialog.showModal();
            document.body.classList.add("dialog-open");
        }

        document.querySelectorAll("[data-project]").forEach(function (button) {
            button.addEventListener("click", function () {
                openProject(projects[button.getAttribute("data-project")]);
            });
        });

        dialog.addEventListener("close", function () {
            document.body.classList.remove("dialog-open");
        });

        const closeButton = dialog.querySelector("[data-close-dialog]");
        if (closeButton) {
            closeButton.addEventListener("click", function () {
                dialog.close();
            });
        }

        dialog.addEventListener("click", function (event) {
            if (event.target !== dialog) return;
            const rect = dialog.getBoundingClientRect();
            const inside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;
            if (!inside) dialog.close();
        });
    }

    /* ---------- Toast ---------- */
    const toast = document.getElementById("toast");
    let toastTimer = null;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toast.classList.remove("is-visible");
        }, 3200);
    }

    /* ---------- Share ---------- */
    document.querySelectorAll("[data-share]").forEach(function (button) {
        button.addEventListener("click", async function () {
            const shareData = {
                title: "LUNCLIN Studio",
                text: "Инди-студия из Нижнего Новгорода: Roblox, Unity, Steam.",
                url: window.location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast("Ссылка на сайт скопирована");
                } else {
                    showToast("Скопируй адрес из строки браузера");
                }
            } catch (error) {
                if (error && error.name !== "AbortError") {
                    showToast("Не удалось поделиться — скопируй адрес вручную");
                }
            }
        });
    });

    /* ---------- Logo easter egg ---------- */
    const brand = document.querySelector(".brand");
    if (brand) {
        let clicks = 0;
        let timer = null;
        brand.addEventListener("click", function () {
            clicks += 1;
            window.clearTimeout(timer);
            timer = window.setTimeout(function () {
                clicks = 0;
            }, 2500);
            if (clicks >= 5) {
                clicks = 0;
                showToast("🌙 Лунный свет уже на твоей стороне…");
            }
        });
    }

    /* ---------- Footer year ---------- */
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    /* ---------- Contact form ---------- */
    const form = document.getElementById("contactForm");

    if (form) {
        const feedback = document.getElementById("formFeedback");
        const submitButton = form.querySelector('button[type="submit"]');
        const submitLabel = submitButton ? submitButton.innerHTML : "";
        const ajaxEndpoint = "https://formsubmit.co/ajax/lunclin.studio@gmail.com";

        function setFeedback(message, type) {
            if (!feedback) return;
            feedback.textContent = message;
            feedback.classList.remove("is-error", "is-success");
            if (type) feedback.classList.add("is-" + type);
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const honey = form.querySelector('[name="_honey"]');
            if (honey && honey.value) return;

            const data = Object.fromEntries(new FormData(form));
            delete data._honey;

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Отправляем…";
            }
            form.setAttribute("aria-busy", "true");
            setFeedback("", null);

            try {
                const response = await fetch(ajaxEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify(
                        Object.assign({}, data, {
                            _subject: "Новое сообщение с сайта LUNCLIN",
                            _template: "table",
                            _captcha: "false"
                        })
                    )
                });

                if (!response.ok) throw new Error("HTTP " + response.status);
                const result = await response.json().catch(function () {
                    return {};
                });
                if (result.success === false || result.success === "false") {
                    throw new Error("Form rejected");
                }

                setFeedback(
                    "Спасибо! Сообщение отправлено — ответим на указанный email.",
                    "success"
                );
                form.reset();
            } catch (error) {
                const subject = encodeURIComponent("Сообщение с сайта LUNCLIN");
                const body = encodeURIComponent(
                    "Имя: " +
                        (data.name || "") +
                        "\nEmail: " +
                        (data.email || "") +
                        "\nТема: " +
                        (data.topic || "") +
                        "\n\n" +
                        (data.message || "")
                );

                setFeedback(
                    "Не удалось отправить автоматически. Открываю почтовый клиент — если он не открылся, напиши на lunclin.studio@gmail.com.",
                    "error"
                );
                window.location.href =
                    "mailto:lunclin.studio@gmail.com?subject=" + subject + "&body=" + body;
            } finally {
                form.removeAttribute("aria-busy");
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = submitLabel;
                }
            }
        });
    }

    /* ---------- Image fallbacks for team avatars ---------- */
    document.querySelectorAll(".team-avatar img").forEach(function (image) {
        function hideBrokenImage() {
            image.classList.add("is-hidden");
        }

        image.addEventListener("error", hideBrokenImage);
        if (image.complete && image.naturalWidth === 0) hideBrokenImage();
    });
})();
