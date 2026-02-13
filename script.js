const canvas = document.getElementById('petalsCanvas');
const ctx = canvas.getContext('2d');
const envelope = document.getElementById('envelope');
const envelopeContainer = document.getElementById('envelopeContainer');
const letter = document.getElementById('letter');
const instruction = document.querySelector('.instruction');
const audioControl = document.getElementById('audioControl');
const musicToggle = document.getElementById('musicToggle');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Detectar dispositivo móvil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

let petals = [];
let isOpened = false;
let musicPlaying = false;
let sparkles = [];
let butterflies = [];
let currentPage = 1;
const totalPages = 3;
let heartSnow = [];
let isHoveringLetter = false;

// Audio elements
const backgroundMusic = new Audio();

// Inicializar páginas: asegurar que solo la 1 esté visible
function initializePages() {
    console.log('Inicializando páginas al cargar');
    const page1 = document.querySelector('.page-1');
    const page2 = document.querySelector('.page-2');
    const page3 = document.querySelector('.page-3');
    
    console.log('Páginas encontradas:', { page1, page2, page3 });
    
    if (page1) page1.classList.add('active');
    if (page2) page2.classList.remove('active');
    if (page3) page3.classList.remove('active');
    
    console.log('Página 1 activa:', page1?.classList.contains('active'));
}

// Ejecutar al cargar
initializePages();

// Configurar música de fondo (puedes reemplazar con tu propia URL)
// Usando una melodía romántica libre de derechos
backgroundMusic.src = 'EnamoradoTuyo.mp3'; // Romantic Piano
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

// Control de música
musicToggle.addEventListener('click', toggleMusic);

function toggleMusic() {
    if (musicPlaying) {
        backgroundMusic.pause();
        musicToggle.classList.add('paused');
        musicPlaying = false;
    } else {
        backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        musicToggle.classList.remove('paused');
        musicPlaying = true;
    }
}

// Clase para corazones de nieve
class HeartSnow {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.life = 1;
        this.decay = Math.random() * 0.01 + 0.005;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }
    
    draw() {
        if (this.life > 0) {
            ctx.save();
            ctx.globalAlpha = this.opacity * this.life;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // Dibujar corazón
            ctx.fillStyle = '#ff6b9d';
            ctx.beginPath();
            const size = this.size;
            ctx.moveTo(0, size / 4);
            ctx.bezierCurveTo(-size / 2, -size / 4, -size, size / 8, 0, size);
            ctx.bezierCurveTo(size, size / 8, size / 2, -size / 4, 0, size / 4);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

// Clase para partículas brillantes alrededor del sello
class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.color = Math.random() > 0.5 ? '#ffd700' : '#ffeb3b';
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }
    
    draw() {
        if (this.life > 0) {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// Clase para mariposas
class Butterfly {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 10 + 8;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.wingAngle = 0;
        this.wingSpeed = Math.random() * 0.1 + 0.05;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.color = this.getRandomColor();
    }
    
    getRandomColor() {
        const colors = [
            { r: 255, g: 182, b: 193 },
            { r: 255, g: 218, b: 224 },
            { r: 221, g: 160, b: 221 },
            { r: 255, g: 240, b: 245 }
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.wingAngle += this.wingSpeed;
        
        if (this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.opacity;
        
        const wingFlap = Math.abs(Math.sin(this.wingAngle)) * 0.5 + 0.5;
        
        // Ala izquierda
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(-this.size / 3, 0, this.size * wingFlap, this.size * 0.8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ala derecha
        ctx.beginPath();
        ctx.ellipse(this.size / 3, 0, this.size * wingFlap, this.size * 0.8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Cuerpo
        ctx.fillStyle = 'rgba(100, 50, 50, 0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.15, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Clase para pétalos de rosa
class Petal {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.swingSpeed = Math.random() * 0.05 + 0.02;
        this.swingAmount = Math.random() * 2 + 1;
        this.swing = 0;
        this.color = this.getRandomPink();
    }
    
    getRandomPink() {
        const pinks = [
            { r: 255, g: 182, b: 193 }, // Light pink
            { r: 255, g: 192, b: 203 }, // Pink
            { r: 255, g: 105, b: 180 }, // Hot pink
            { r: 255, g: 150, b: 170 }, // Medium pink
        ];
        const color = pinks[Math.floor(Math.random() * pinks.length)];
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
    }
    
    update() {
        this.y += this.speedY;
        this.swing += this.swingSpeed;
        this.x += Math.sin(this.swing) * this.swingAmount + this.speedX * 0.5;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height + 20) {
            this.reset();
        }
        
        if (this.x < -50 || this.x > canvas.width + 50) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        
        // Dibujar pétalo con forma más realista
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Sombra interna para profundidad
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.fillStyle = 'rgba(200, 50, 100, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.size * 0.2, 0, this.size * 0.5, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Crear pétalos iniciales (cantidad ajustada según dispositivo)
const initialPetals = isMobile ? 4 : 8;
for (let i = 0; i < initialPetals; i++) {
    const petal = new Petal();
    petal.y = Math.random() * canvas.height;
    petals.push(petal);
}

// Crear mariposas (cantidad ajustada según dispositivo)
const initialButterflies = isMobile ? 3 : 5;
for (let i = 0; i < initialButterflies; i++) {
    butterflies.push(new Butterfly());
}

// Animar pétalos y efectos
function animatePetals() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y dibujar pétalos
    petals.forEach(petal => {
        petal.update();
        petal.draw();
    });
    
    // Actualizar y dibujar mariposas
    butterflies.forEach(butterfly => {
        butterfly.update();
        butterfly.draw();
    });
    
    // Actualizar y dibujar partículas brillantes
    sparkles = sparkles.filter(sparkle => sparkle.life > 0);
    sparkles.forEach(sparkle => {
        sparkle.update();
        sparkle.draw();
    });
    
    // Actualizar y dibujar corazones de nieve
    heartSnow = heartSnow.filter(heart => heart.life > 0 && heart.y < canvas.height + 50);
    heartSnow.forEach(heart => {
        heart.update();
        heart.draw();
    });
    
    // Generar partículas alrededor del sello (antes de abrirlo)
    const sparkleChance = isMobile ? 0.85 : 0.8;
    const sparkleCount = isMobile ? 1 : 2;
    
    if (!isOpened && Math.random() > sparkleChance) {
        const envelopeRect = envelope.getBoundingClientRect();
        const sealX = envelopeRect.left + envelopeRect.width / 2;
        const sealY = envelopeRect.top + 70;
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30 + 10;
            sparkles.push(new Sparkle(
                sealX + Math.cos(angle) * distance,
                sealY + Math.sin(angle) * distance
            ));
        }
    }
    
    requestAnimationFrame(animatePetals);
}

animatePetals();

// Manejar click y touch en el sobre
envelope.addEventListener('click', openEnvelope);
envelope.addEventListener('touchend', (e) => {
    e.preventDefault();
    openEnvelope();
});

function openEnvelope() {
    if (isOpened) return;
    isOpened = true;
    
    console.log('Abriendo sobre...');
    document.body.classList.add('letter-open');
    
    // Iniciar navegación de páginas después de ver la carta
    setTimeout(() => {
        initPageNavigation();
    }, 2500);
    
    // Iniciar música de fondo
    backgroundMusic.play().catch(e => console.log('Music play failed:', e));
    musicPlaying = true;
    
    // Mostrar control de audio y botón de cerrar
    setTimeout(() => {
        audioControl.classList.add('visible');
        document.getElementById('closeLetter').classList.add('visible');
    }, 2000);
    
    // Ocultar instrucción
    gsap.to(instruction, {
        opacity: 0,
        duration: 0.5
    });
    
    // Eliminar evento de click
    envelope.style.cursor = 'default';
    envelope.removeEventListener('click', openEnvelope);
    
    // Romper el sello
    gsap.to('.wax-seal', {
        scale: 0,
        rotation: 360,
        duration: 0.5,
        ease: 'back.in'
    });
    
    // Abrir el sobre (levantar la tapa)
    gsap.to('.envelope-flap', {
        rotateX: -180,
        duration: 1,
        delay: 0.6,
        ease: 'power2.inOut',
        transformOrigin: 'top center'
    });
    
    // Mover sobre en desktop; mantener centrado en movil
    const isMobileViewport = window.innerWidth <= 1024;
    
    // Establecer posición inicial correcta ANTES de animar
    // Esto fija el cache de GSAP para que la carta crezca desde arriba (móvil) o centro (desktop)
    if (isMobileViewport) {
        letter.style.top = '4px';
        gsap.set(letter, { xPercent: -50, yPercent: 0, scale: 0, opacity: 0 });
    } else {
        letter.style.top = '50%';
        gsap.set(letter, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    }
    
    gsap.to(envelope, {
        y: isMobileViewport ? 0 : -100,
        scale: isMobileViewport ? 1 : 0.8,
        duration: 1,
        delay: 1.2,
        ease: 'power2.inOut'
    });
    
    // Mostrar la carta saliendo del sobre
    gsap.to(letter, {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 1.5,
        ease: 'back.out(1.2)',
        onStart: () => {
            console.log('Iniciando animación de carta...');
            letter.style.display = 'flex';
        },
        onComplete: () => {
            console.log('Animación de carta completada');
            letter.style.opacity = '1';
        }
    });
    
    // Animar el contenido de la carta con efecto de escritura
    gsap.from('.letter-header', {
        opacity: 0,
        y: -30,
        duration: 0.8,
        delay: 2.2,
        ease: 'power2.out'
    });
    
    // Efecto de escritura para cada párrafo
    const paragraphs = document.querySelectorAll('.letter-text p');
    let totalDelay = 2500;
    
    // Velocidad ajustada según dispositivo
    const baseTypingSpeed = isMobile ? 20 : 30; // más rápido en móvil
    const pauseBetween = isMobile ? 300 : 500;
    
    paragraphs.forEach((p, index) => {
        const text = p.textContent;
        const charCount = text.length;
        const typingSpeed = baseTypingSpeed; // ms por carácter
        const typingDuration = charCount * typingSpeed;
        
        p.textContent = '';
        p.classList.add('typing');
        
        setTimeout(() => {
            let charIndex = 0;
            const typingInterval = setInterval(() => {
                if (charIndex < text.length) {
                    p.textContent += text[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typingInterval);
                }
            }, typingSpeed);
        }, totalDelay);
        
        totalDelay += typingDuration + pauseBetween;
    });
    
    gsap.from('.letter-signature', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: totalDelay / 1000,
        ease: 'power2.out'
    });
    
    // Aumentar pétalos después de abrir (cantidad ajustada según dispositivo)
    setTimeout(() => {
        const additionalPetals = isMobile ? 2 : 5;
        for (let i = 0; i < additionalPetals; i++) {
            petals.push(new Petal());
        }
        // Agregar más mariposas
        const additionalButterflies = isMobile ? 2 : 3;
        for (let i = 0; i < additionalButterflies; i++) {
            butterflies.push(new Butterfly());
        }
    }, 1500);
}

// Ajustar canvas al cambiar tamaño
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Efecto de nieve de corazones al hacer hover sobre la carta
letter.addEventListener('mouseenter', () => {
    isHoveringLetter = true;
});

letter.addEventListener('mouseleave', () => {
    isHoveringLetter = false;
});

// Soporte touch para móviles
letter.addEventListener('touchstart', () => {
    isHoveringLetter = true;
});

letter.addEventListener('touchend', () => {
    isHoveringLetter = false;
});

letter.addEventListener('mousemove', (e) => {
    if (!isOpened || !isHoveringLetter) return;
    
    // Ajustar frecuencia según dispositivo
    const spawnChance = isMobile ? 0.9 : 0.85;
    const maxHearts = isMobile ? 15 : 30;
    
    // Generar corazones de nieve ocasionalmente
    if (Math.random() > spawnChance) {
        const rect = letter.getBoundingClientRect();
        const x = e.clientX;
        const y = rect.top + Math.random() * 50; // Desde la parte superior de la carta
        
        heartSnow.push(new HeartSnow(x, y));
        
        // Limitar cantidad de corazones
        if (heartSnow.length > maxHearts) {
            heartSnow.shift();
        }
    }
});

// Soporte touch para móviles
letter.addEventListener('touchmove', (e) => {
    if (!isOpened || !isHoveringLetter) return;
    
    const touch = e.touches[0];
    const spawnChance = 0.92; // Menos frecuente en touch
    const maxHearts = 15;
    
    if (Math.random() > spawnChance) {
        const rect = letter.getBoundingClientRect();
        const x = touch.clientX;
        const y = rect.top + Math.random() * 50;
        
        heartSnow.push(new HeartSnow(x, y));
        
        if (heartSnow.length > maxHearts) {
            heartSnow.shift();
        }
    }
});

// Evento para cerrar la carta
document.getElementById('closeLetter').addEventListener('click', closeLetter);

// Manejo de mensajes secretos para móviles (tap para mostrar/ocultar)
if (isMobile) {
    document.addEventListener('click', (e) => {
        const secretMessage = e.target.closest('.secret-message');
        
        if (secretMessage) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle activo
            const wasActive = secretMessage.classList.contains('active');
            
            // Remover active de todos
            document.querySelectorAll('.secret-message.active').forEach(msg => {
                msg.classList.remove('active');
            });
            
            // Si no estaba activo, activarlo
            if (!wasActive) {
                secretMessage.classList.add('active');
                
                // Auto-ocultar después de 3 segundos
                setTimeout(() => {
                    secretMessage.classList.remove('active');
                }, 3000);
            }
        } else {
            // Click fuera, cerrar todos
            document.querySelectorAll('.secret-message.active').forEach(msg => {
                msg.classList.remove('active');
            });
        }
    });
}

// Sistema de navegación entre páginas
function initPageNavigation() {
    const pageNav = document.getElementById('pageNav');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageDots = document.querySelectorAll('.page-dot');
    
    console.log('Inicializando navegación de páginas');
    console.log('Elementos encontrados:', { pageNav, prevBtn, nextBtn, dots: pageDots.length });
    
    // Mostrar navegación después de abrir la carta
    setTimeout(() => {
        pageNav.classList.add('visible');
        console.log('Navegación visible');
    }, 3000);
    
    prevBtn.addEventListener('click', () => {
        console.log('Click en prev, página actual:', currentPage);
        changePage(currentPage - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        console.log('Click en next, página actual:', currentPage);
        changePage(currentPage + 1);
    });
    
    pageDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const page = parseInt(dot.getAttribute('data-page'));
            console.log('Click en dot, cambiar a página:', page);
            changePage(page);
        });
    });
    
    // Soporte para swipe en móviles
    if (isMobile) {
        console.log('Activando soporte para swipe');
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50;
        
        letter.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        letter.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            console.log('Swipe detectado, distancia:', swipeDistance);
            
            if (Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0 && currentPage > 1) {
                    // Swipe derecha - página anterior
                    console.log('Swipe derecha, ir a página anterior');
                    changePage(currentPage - 1);
                } else if (swipeDistance < 0 && currentPage < totalPages) {
                    // Swipe izquierda - página siguiente
                    console.log('Swipe izquierda, ir a página siguiente');
                    changePage(currentPage + 1);
                }
            }
        }
    }
    
    updateNavigation();
}

function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    
    console.log('Cambiando de página', currentPage, 'a', newPage);
    
    // Primero ocultar TODAS las páginas
    document.querySelectorAll('.letter-content-wrapper').forEach(wrapper => {
        wrapper.classList.remove('active');
        // Reset scroll position
        wrapper.scrollTop = 0;
    });
    
    // Luego mostrar solo la nueva página
    const newWrapper = document.querySelector(`.page-${newPage}`);
    if (newWrapper) {
        console.log('Activando página', newPage);
        newWrapper.classList.add('active');
        
        // Actualizar número de página
        currentPage = newPage;
        updateNavigation();
        
        // Asegurar que el scroll esté arriba
        newWrapper.scrollTop = 0;
        
        // Reiniciar animaciones de la página cuando se activa
        if (newPage === 2) {
            // Reiniciar animaciones de versos
            const verses = newWrapper.querySelectorAll('.verse');
            verses.forEach(verse => {
                verse.style.animation = 'none';
                verse.offsetHeight; // trigger reflow
                verse.style.animation = '';
            });
        } else if (newPage === 3) {
            // Reiniciar animaciones de razones
            const reasons = newWrapper.querySelectorAll('.reason-item');
            reasons.forEach(reason => {
                reason.style.animation = 'none';
                reason.offsetHeight; // trigger reflow
                reason.style.animation = '';
            });
        }
    } else {
        console.error('No se encontró la página', newPage);
    }
}

// Soporte para teclas de flecha en desktop
document.addEventListener('keydown', (e) => {
    if (!isOpened) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        changePage(currentPage - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        changePage(currentPage + 1);
    }
});

// Función para cerrar la carta
function closeLetter() {
    if (!isOpened) return;
    
    const closeBtn = document.getElementById('closeLetter');
    const pageNav = document.getElementById('pageNav');
    
    // Ocultar botón de cerrar y navegación
    closeBtn.classList.remove('visible');
    pageNav.classList.remove('visible');
    
    // Animar carta cerrándose
    gsap.to(letter, {
        opacity: 0,
        scale: 0,
        duration: 0.8,
        ease: 'back.in(1.2)',
        onComplete: () => {
            document.body.classList.remove('letter-open');
            // Resetear posición y cache de GSAP al estado inicial centrado
            letter.style.top = '50%';
            gsap.set(letter, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
        }
    });
    
    // Restaurar sobre
    gsap.to(envelope, {
        y: 0,
        scale: 1,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out'
    });
    
    // Restaurar solapa
    gsap.to('.envelope-flap', {
        rotateX: 0,
        duration: 1,
        delay: 0.8,
        ease: 'power2.inOut'
    });
    
    // Restaurar sello
    gsap.to('.wax-seal', {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        delay: 1,
        ease: 'back.out(1.2)'
    });
    
    // Mostrar instrucción
    setTimeout(() => {
        gsap.to(instruction, {
            opacity: 1,
            duration: 0.5
        });
    }, 1300);
    
    // Restaurar evento de click y cursor
    setTimeout(() => {
        envelope.style.cursor = 'pointer';
        envelope.addEventListener('click', openEnvelope);
        isOpened = false;
        
        // Resetear a la primera página
        document.querySelector('.page-1').classList.add('active');
        document.querySelector('.page-2')?.classList.remove('active');
        document.querySelector('.page-3')?.classList.remove('active');
        currentPage = 1;
        
        // Limpiar corazones de nieve
        heartSnow = [];
    }, 1500);
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageDots = document.querySelectorAll('.page-dot');
    
    console.log('Actualizando navegación, página actual:', currentPage);
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    pageDots.forEach((dot, index) => {
        if (index + 1 === currentPage) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

