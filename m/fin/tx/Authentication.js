class Authentication {
    constructor(refreshCallback) {
      this.refreshCallback = refreshCallback;
    }

    init() {
      fetch('/session/check', {
        credentials: 'include'
      }).then(response => {
        if (response.status === 401) {
          this.signIn();
        } else {
          this.refreshCallback();
        }
      });
    }

    signIn() {
      gapi.load('auth2', () => {
        gapi.auth2.init({
          'client_id': '642857611880-5qro3tqn16hegvf9jin4ajfdnjpp2dje.apps.googleusercontent.com',
          'ux_mode': 'popup'
        }).then(googleAuth => {
          if (!googleAuth.isSignedIn.get()) {
            googleAuth.signIn({
              scope: 'profile email'
            }).then(this.onSignIn);
          } else {
            this.onSignIn(gapi.auth2.getAuthInstance());
          }
        }, error => {
          console.error(error);
        });
      });
    }

    onSignIn(googleAuth) {
      let user = googleAuth.currentUser.get();
      this.exchangeJwtForAccessToken(user.getAuthResponse().id_token);
    }

    exchangeJwtForAccessToken(jwt) {
      fetch('/session/create', {
        headers: {
          'Authorization': 'Google ' + jwt
        }
      }).then(function (response) {
        return response.json();
      }).then(response => {
        this.refreshCallback();
      });
    }
}
