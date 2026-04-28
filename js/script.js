document.addEventListener('DOMContentLoaded', () => {

    const authBox = document.getElementById('auth-box');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && authBox) {
        authBox.innerHTML = `
            <span>Жүйеге кірген: <strong>${currentUser.name}</strong></span>
            <button id="logout-btn" class="btn btn-sm btn-danger">Шығу</button>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }

    // 1-тапсырма:  
    const t1Btn = document.getElementById('t1-btn');
    if (t1Btn) {
        t1Btn.addEventListener('click', () => {
            const t1Text = document.getElementById('t1-text');
            t1Text.textContent = "Құттықтаймыз! Сізге 15% жеңілдік промокоды берілді: NEW15";
            t1Text.style.color = "#27ae60";
            t1Text.style.fontWeight = "bold";
            t1Btn.style.display = "none";
        });
    }

    // 2-тапсырма: 
    const t2Btn = document.getElementById('t2-btn');
    if (t2Btn) {
        t2Btn.addEventListener('click', () => {
            const inputVal = document.getElementById('t2-input').value.trim();
            const resultMsg = document.getElementById('t2-result');

            if (inputVal === "") {
                resultMsg.textContent = "Қате: Атыңызды немесе поштаңызды енгізіңіз!";
                resultMsg.style.color = "#e74c3c";
            } else {
                resultMsg.textContent = `Құрметті ${inputVal}, сіз жаңалықтарға сәтті жазылдыңыз!`;
                resultMsg.style.color = "#2ecc71";
            }
        });
    }

    // 3-тапсырма:  
    const t3AddBtn = document.getElementById('t3-add-btn');
    const t3RemoveBtn = document.getElementById('t3-remove-btn');
    const t3List = document.getElementById('t3-list');

    if (t3AddBtn) {
        let count = 1;
        t3AddBtn.addEventListener('click', () => {
            const li = document.createElement('li');
            li.textContent = `Таңдаулы зат ${count++}`;
            li.style.padding = "10px";
            li.style.background = "#fff";
            li.style.border = "1px solid #ddd";
            li.style.marginTop = "5px";
            li.style.borderRadius = "4px";
            t3List.appendChild(li);
        });

        t3RemoveBtn.addEventListener('click', () => {
            if (t3List.lastElementChild) {
                t3List.removeChild(t3List.lastElementChild);
            }
        });
    }

    // 4-тапсырма: 
    const t4ToggleBtn = document.getElementById('t4-toggle-btn');
    if (t4ToggleBtn) {
        t4ToggleBtn.addEventListener('click', () => {
            const t4Box = document.getElementById('t4-box');
            t4Box.classList.toggle('hidden');
        });
    }

    // 5-тапсырма: 
    const t5Counter = document.getElementById('t5-counter');
    if (t5Counter) {
        let users = 1240;
        t5Counter.textContent = users;
        setInterval(() => {
            users++;
            t5Counter.textContent = users;
        }, 1000);
    }

    // 6-тапсырма: 
    const t6Btn = document.getElementById('t6-btn');
    if (t6Btn) {
        t6Btn.addEventListener('click', () => {
            const t6Box = document.getElementById('t6-box');
            t6Box.classList.toggle('active-style');
        });
    }

    // 7-тапсырма: 
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const errorMsg = document.getElementById('reg-error');
            if (!name || !email || !password) {
                errorMsg.textContent = "Барлық өрістерді толтырыңыз!";
                return;
            }
            if (password.length < 6) {
                errorMsg.textContent = "Құпиясөз кемінде 6 символ болуы керек!";
                return;
            }
            const user = { name, email, password };
            localStorage.setItem('userDB', JSON.stringify(user));

            errorMsg.style.color = "green";
            errorMsg.textContent = "Сәтті тіркелдіңіз! Кіру бетіне өтіңіз.";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        });
    }

    // 8-тапсырма:
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('log-email').value.trim();
            const password = document.getElementById('log-password').value;
            const msg = document.getElementById('log-msg');
            const storedUser = JSON.parse(localStorage.getItem('userDB'));
            if (!storedUser) {
                msg.textContent = "Қолданушы табылған жоқ. Тіркеліңіз.";
                msg.style.color = "red";
                return;
            }
            if (email === storedUser.email && password === storedUser.password) {
                msg.textContent = "Сәтті кірдіңіз!";
                msg.style.color = "green";
                localStorage.setItem('currentUser', JSON.stringify({ name: storedUser.name, email: storedUser.email }));
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } else {
                msg.textContent = "Email немесе құпиясөз қате";
                msg.style.color = "red";
            }
        });
    }

});
