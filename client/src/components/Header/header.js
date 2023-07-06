import React, { useState, useEffect } from "react"
import { AppBar, Typography, Avatar, Button, Toolbar } from "@material-ui/core"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import decode from "jwt-decode"
import * as constantVar from "../../constants/constantVar"
import useStyles from "./styles"

const Header = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("profile")))
    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()
    const classes = useStyles()

    function logout() {
        dispatch({ type: constantVar.LOGOUT })

        navigate("/auth")

        setUser(null)
    }

    useEffect(() => {
        const token = user?.token

        if (token) {
            const decodedToken = decode(token)

            if (decodedToken.exp * 1000 < new Date().getTime()) logout()
        }

        setUser(JSON.parse(localStorage.getItem("profile")))
        console.log(user)
    }, [location])

    return (
        <AppBar className={classes.appBar} position="static" color="inherit">
            <div className={classes.brandContainer}>
                <Typography
                    component={Link}
                    to="/"
                    className={classes.heading}
                    variant="h2"
                    align="center"
                >
                    Hyper Saucer
                </Typography>
            </div>

            <Button
                className={classes.purple}
                component={Link}
                to="/sample"
                variant="contained"
                color="secondary"
            >
                See Sample
            </Button>

            <Button className={classes.purple} component={Link} to="/askAI" variant="contained" color="secondary">
                    Ask AI
            </Button>

            <Toolbar className={classes.toolbar}>
                {user?.result ? (
                    <div className={classes.profile}>
                        <Avatar className={classes.purple} alt={user?.result.name} src={user?.result.picture}>{user?.result.name.charAt(0)}</Avatar>
                        <Typography className={classes.userName} variant="h6">
                            {user?.result.given_name || user?.result.name}
                        </Typography>
                        <Button
                            variant="contained"
                            className={classes.logout}
                            color="secondary"
                            onClick={logout}
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Button component={Link} to="/auth" variant="contained" color="primary">
                        Sign In
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    )
}

export default Header
