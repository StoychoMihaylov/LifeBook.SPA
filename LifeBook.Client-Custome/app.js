$(() => {
    setGreeting();
    //App constants
    const baseUrl = 'http://localhost:53085/';

    //Menu links
    $('#linkHome').click(() => showView('home'));
    $('#linkLogin').click(() => showView('login'));
    $('#linkRegister').click(() => showView('register'));
    $('#linkArticles').click(() => showView('articles'));
    $('#linkCreateArticle').click(() => showView('createArticle'));
    $('#linkLogout').click(logout);

    //CRUD operations
    $('#viewLogin').find('form').submit(login);
    $('#viewRegister').find('form').submit(register);
    $('#viewCreateArticle').find('form').submit(createArticle);

    //Notifications
    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => $('#loadingBox').hide()
    });
    $('#infoBox').click((event) => $(event.target).hide());
    $('#errorBox').click((event) => $(event.target).hide());

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(() => $('#infoBox').fadeOut(), 1000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
        setTimeout(() => $('#errorBox').fadeOut(), 3000);
    }

    function showView(name) {
        $('section').hide();

        switch (name) {
            case 'home':
                $('#viewHome').show();
                break;
            case 'login':
                $('#viewLogin').show();
                break;
            case 'register':
                $('#viewRegister').show();
                break;
            case 'articles':
                getArticles();
                $('#viewArticles').show();
                break;
            case 'createArticle':
                $('#viewCreateArticle').show();
                break;
        }
    }

    function request(uri, method, data) {
        let req = {
            url: baseUrl + uri,
            method: method,
            headers: {
                'Authorization': 'Bearer ' + localStorage.access_token
            }
        }
        if (data !== undefined) {
            req.data = JSON.stringify(data);
        }

        return $.ajax(req);
    }

    function setGreeting() {
        if (localStorage.email !== undefined) {
            $('#greeting').text(`Welcome,${localStorage.email}!`);
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkArticles').show();
            $('#linkCreateArticle').show();
            $('#linkLogout').show();
        } else {
            $('#greeting').text('');
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkArticles').hide();
            $('#linkCreateArticle').hide();
            $('#linkLogout').hide();
        }
    }

    function logout() {
        let req = {
            url: baseUrl + 'api/' + 'Account/' + 'Logout',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.access_token
            },
            success: logoutSuccess,
            error: (reason) => { console.col(reason) }
        }

        $.ajax(req);

        function logoutSuccess(data) {
            showInfo('Logout successful');
            localStorage.clear();
            setGreeting();
            showView('home');
        }
    }

    function login(e) {
        e.preventDefault();
        let username = $('#loginUsername').val();
        let password = $('#loginPassword').val();

        if (username.length === 0) {
            showError("E-mail cannot be empty");
            return;
        }
        if (password.length === 0) {
            showError("E-mail cannot be empty");
            return;
        }

        let req = {
            url: baseUrl + 'Token',
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            data: {
                username: username,
                password: password,
                grant_type: 'password'
            },
            success: LoginSuccess,
            error: handleError
        }

        $.ajax(req);

        function LoginSuccess(data) {
            showInfo('Login successful');
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('email', data.userName);
            localStorage.setItem('userId', data.id);
            $('#greeting').text(`Welcome, ${localStorage.email}!`);
            setGreeting();
            showView('articles');
        }

        function handleError(reason) {
            console.log(reason);
            showError(reason.responseJSON.error_description);
        }
    }

    function register(e) {
        console.log('attepting register')
        e.preventDefault();
        let email = $('#registerEmail').val();
        let password = $('#registerPassword').val();
        let confirmPassword = $('#registerConfirmPassword').val();

        if (email.length === 0) {
            showError("E-mail cannot be empty");
            return;
        }
        if (password.length === 0) {
            showError("E-mail cannot be empty");
            return;
        }
        if (confirmPassword.length === 0) {
            showError("E-mail cannot be empty");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords don't match");
            return;
        }

        let req = {
            url: baseUrl + 'Api/' + 'Account/' + 'Register',
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: JSON.stringify({
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }),
            success: registerSuccess,
            error: handleError
        }

        $.ajax(req);

        function registerSuccess(data) {
            showInfo('Register successful');
            showView('login');
        }

        function handleError(reason) {
            console.log(reason);
            showError(reason.responseJSON.ModelState[""][1]);
        }
    }

    function getArticles() {
        let req = {
            url: baseUrl + 'Api/' + 'Articles',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.access_token,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            success: displayArticles,
            error: handleError
        }

        $.ajax(req);

        function displayArticles(data) {
            $('#articles-container').empty();
            for (let article of data) {
                let row = $('<div class="article-item">');
                row.append(`<div class="articleTitle"><h2>${article.Title}</h2></div>`);
                row.append(`<p>Date: ${article.Date}</p>`);
                row.append('</div>');
                row.appendTo('#articles-container');
            }
        }

        function handleError(reason) {
            console.log(reason);
            showError(reason.responseJSON.ModelState[""][1]);
        }
    }

    function createArticle() {
        console.log('here');
        let title = $('#titleCreateArticle').val();
        let content = $('#contentCreateArticle').val();

        if (title.length === 0) {
            showError("Title cannot be empty");
            return;
        }
        if (content.length === 0) {
            showError("Content cannot be empty");
            return;
        }

        let req = {
            url: baseUrl + 'Api/' + 'Articles',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.access_token,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: JSON.stringify({
                title,
                content
            }),
            success: createSuccess,
            error: handleError
        }

        $.ajax(req);

        function createSuccess(data) {
            $('#titleCreateArticle').val('');
            $('#contentCreateArticle').val('');
            showInfo('The article was created successful')
            showView('articles');
        }

        function handleError(reason) {
            console.log(reason);
            showError(reason.responseJSON.ModelState[""][1]);
        }
    }
});