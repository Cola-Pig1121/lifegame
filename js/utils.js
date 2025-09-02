function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function typewriterEffect(element, text, speed = 50) {
    return new Promise(resolve => {
        // 检查文本是否为空或未定义
        if (!text || typeof text !== 'string') {
            element.innerHTML = '';
            resolve();
            return;
        }
        
        element.innerHTML = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                const char = text.charAt(i);
                const span = document.createElement('span');
                span.className = 'typewriter-char';
                span.textContent = char;
                element.appendChild(span);
                i++;
                setTimeout(type, speed);
            } else {
                element.innerHTML = text; // Replace with full text to allow selection
                resolve();
            }
        }
        type();
    });
}
