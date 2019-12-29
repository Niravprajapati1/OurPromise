import React, { useState, Fragment } from "react";
import {
  Divider,
  useTheme,
  useMediaQuery,
  Box,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import { makeStyles } from '@material-ui/styles';
import GoogleButton from 'react-google-button';
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import VerticalBanner from "../common/VerticalBanner";
import { useFirebase } from 'react-redux-firebase';
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

// component level styling
const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    [theme.breakpoints.up('md')]: {
      flexDirection: "row",
    }
  },
  // banner: {
  //   maxWidth: "100vw",
  //   backgroundImage: props => `url(${Background})`,
  //   backgroundPositionX: "center",
  //   backgroundPositionY: "center",
  //   backgroundRepeat: "no-repeat",
  //   backgroundSize: "cover",
  //   height: "40vh",
  //   [theme.breakpoints.up('md')]: {
  //     width: "60vw",
  //     height: "auto",
  //     minHeight: "calc(100vh - 64px)",
  //   },
  // },
  sidebox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: theme.spacing(2),
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  socialLogin: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "16px",
  },
  title: {
    width: "80%",
    margin: "16px",
    [theme.breakpoints.up('md')]: {
      width: "70%",
    }
  },
  help: {
    width: "100%",
  },
  textfield: {
    margin: theme.spacing(1),
    width: "100%",
  },
  button: {
    margin: theme.spacing(2),
  },
  caption: {
    width: "100%",
    height: "100%",
  },
  facebookLogin: {
    width: "240px !important",
    fontSize: "16px !important",
    fontFamily: "Roboto, arial, sans-serif !important",
    marginTop: "12px !important",
  }
}));
function Login() {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("heandleing");
    console.log(e);
  }
  const [error, setError] = useState(false);

  const history = useHistory();
  const isLoggedin = useSelector(state => state.firebase.auth.uid);
  if (isLoggedin) {
    history.push("/")
  }

  const firebase = useFirebase();
  const handleGoogleLogin = () => {
    firebase.login({
      provider: 'google',
      type: 'redirect',
    })
      .then(() => { history.push("/") })
      .catch(() => { setError("Fail to Login.. Please try again"); })
  }
  const handleFacebookLogin = () => {
    firebase.login({
      provider: 'facebook',
      type: 'redirect',
    })
      .then(() => { history.push("/") })
      .catch(() => { setError("Fail to Login.. Please try again"); })
  }

  return (
    <div className={classes.container}>
      <VerticalBanner banner="login" />
      <Box className={classes.sidebox}>
        <Box id="social-login" className={classes.socialLogin}>
          <GoogleButton
            type="light"
            onClick={handleGoogleLogin}
          />
          <FacebookLoginButton className={classes.facebookLogin} onClick={handleFacebookLogin}>
            <span style={{ paddingLeft: '12px' }}>Sign in with Facebook</span>
          </FacebookLoginButton>
        </Box>
        <Divider />
        <Box id="title" className={classes.title}>
          <Typography variant="h5" color="inherit" align="center" >
            Traditional Login
            </Typography>
          <Button>
            <Typography component="div" variant="caption" color="inherit" align="center" >
              Why do I need to login?
            </Typography>
          </Button>
        </Box>
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            id="email"
            className={classes.textfield}
            label="Email"
            type="email"
            variant="outlined"
          />
          <TextField
            id="password"
            className={classes.textfield}
            label="Password"
            type="password"
            variant="outlined"
          />
          <Box id="login-help" className={classes.help}>
            <Typography component="div" variant="body1" color="inherit">
              Forget password
            </Typography>
            <Typography component="div" variant="body1" color="inherit">
              Create new account
            </Typography>
          </Box>
          <Button
            className={classes.button}
            variant="contained"
            size="large"
            color="primary"
            type="submit"
          >
            Login
            </Button>
        </form>
      </Box>
    </div>
  );
}

export default Login;