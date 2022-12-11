import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import Toolbar from "@material-ui/core/Toolbar";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import makeStyles from "@material-ui/styles/makeStyles";
import { useSelector, useDispatch } from "react-redux";
import { useFirebase } from "react-redux-firebase";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import DefaultAvatar from "../assets/images/favicon.png";
import { setAppTitle } from "../store/actions/appActions";

const useStyles = makeStyles((theme) => ({
  appbar: {
    width: "100%",
    maxWidth: "100vw",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
  },
  logo: {
    height: "40px",
  },
  appTitle: {
    margin: `0 ${theme.spacing(2)}px`,
    flexGrow: 1,
  },
  active: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  tab: {
    margin: `0 ${theme.spacing(0.5)}px`,
    minWidth: "60px",
  },
  login: {
    margin: `0 ${theme.spacing(1.5)}px`,
  },
}));

function NavbarDesktop() {
  const classes = useStyles();
  const navigate = useNavigate();

  const isLoggedin = useSelector((state) => state.firebase.auth.uid);
  const verified = useSelector((state) => state.firebase.profile.verified);
  const avatar = useSelector((state) => state.firebase.profile.avatarUrl);
  const [avatarMenu, setAvatarMenu] = useState(null);
  // set AppBar Title
  const dispatch = useDispatch();
  const appTitle = useSelector((state) => state.app.appTitle);
  const location = useLocation();
  const currentUrl = location.pathname;
  useEffect(() => {
    dispatch(setAppTitle(currentUrl));
  }, [currentUrl, dispatch]);
  // Handle Logout
  const firebase = useFirebase();
  const handleLogout = () => {
    setAvatarMenu(null);
    firebase.logout();
  };
  return (
    <Toolbar className={classes.appbar}>
      <Button id="logo" component={NavLink} to="/">
        <img alt="logo" src={Logo} className={classes.logo} />
      </Button>
      <Typography variant="h6" className={classes.appTitle}>
        {appTitle}
      </Typography>
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="nowrap"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Box>
          <Button
            component={NavLink}
            to="/graduates"
            activeClassName={classes.active}
            className={classes.tab}
          >
            graduates
          </Button>
          <Button
            component={NavLink}
            to="/lecturers"
            activeClassName={classes.active}
            className={classes.tab}
          >
            lecturers
          </Button>
          <Button
            component={NavLink}
            to="/videos"
            activeClassName={classes.active}
            className={classes.tab}
          >
            KMPk TV
          </Button>
          <Button
            component={NavLink}
            to="/magazine"
            activeClassName={classes.active}
            className={classes.tab}
          >
            Magazine
          </Button>
          {isLoggedin ? (
            <>
              <IconButton
                onClick={(e) => {
                  setAvatarMenu(e.currentTarget);
                }}
              >
                <Avatar alt="me" src={avatar || DefaultAvatar} />
              </IconButton>
              <Menu
                anchorEl={avatarMenu}
                open={Boolean(avatarMenu)}
                onClose={() => {
                  setAvatarMenu(null);
                }}
              >
                {verified ? null : (
                  <MenuItem
                    component={Button}
                    onClick={() => {
                      navigate("/auth/verify");
                    }}
                  >
                    Verify
                  </MenuItem>
                )}
                <MenuItem component={Button} onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              className={classes.login}
              component={NavLink}
              to="/auth/login"
              variant="contained"
              color="primary"
            >
              Login
            </Button>
          )}
        </Box>
      </Box>
    </Toolbar>
  );
}

export default NavbarDesktop;
