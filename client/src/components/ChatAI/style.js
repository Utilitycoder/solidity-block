import { makeStyles } from "@material-ui/core"

export default makeStyles((theme) => ({
    mainContainer: {
        display: "flex",
        alignItems: "center",
    },
    smMargin: {
        margin: theme.spacing(1),
    },
    app: {
        width: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        lineHeight: "48x",
        fontSize: "30px",
        textDecoration: "none",
    },
    chatContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
        msOverflowY: "scroll",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        paddingBottom: "20px",
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": {
            display: "none",
        },
    },
    form: {
        width: "100%",
        margin: "0 auto",
        padding: "10px",
        display: "flex",
        flexDirection: "row",
        gap: "10px",

    }, 
    textarea: {
        width: "100%",
        // color: "#fff",
        fontSize: "18px",
        padding: "10px",
        background: "transparent",
        backgroundColor: "#f5f5f5",
        borderRadius: "5px",
        border: "none", 
        outline: "none",
    },
    button: {
        outline: "0",
        border: "0",
        cursor: "pointer",
        background: "transparent",
    },
    wrapper: {
        width: "100%",
        padding: "15px",
    },
    ai: {
        background: "#40414f",
    },
    chat: {
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "10px",
    },
    profile: {
        width: "36px",
        borderRadius: "5px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#5436da",
    },
    message: {
        flex: "1",
        color: "#dcdcdc",
        fontSize: "20px",

        maxWidth: "100%",
        msOverflowX: "scroll",
        whiteSpace: "pre-wrap",

        msOverflowStyle: "none",
        scrollbarWidth: "none",

        "&::-webkit-scrollbar": {
            display: "none",
        }
    },
    profileImage: {
        width: "10px",
        height: "10px",
        objectFit: "contain",
    }
}))

// .profile {
//     width: 36px;
//     height: 36px;
//     border-radius: 5px;

//     background: #5436da;

//     display: flex;
//     justify-content: center;
//     align-items: center;
// }

// .button {
//     outline: 0;
//     border: 0;
//     cursor: pointer;
//     background: transparent;
// }

// .textarea {
//     width: 100%;

//     color: #fff;
//     font-size: 18px;

//     padding: 10px;
//     background: transparent;
//     border-radius: 5px;
//     border: none;
//     outline: none;
// }

// form {
//     width: 100%;
//     max-width: 1280px;
//     margin: 0 auto;
//     padding: 10px;
//     background: #40414f;

//     display: flex;
//     flex-direction: row;
//     gap: 10px;
// }

// .wrapper {
//     width: 100%;
//     padding: 15px;
// }



// .profile {
//     width: 36px;
//     height: 36px;
//     border-radius: 5px;

//     background: #5436da;

//     display: flex;
//     justify-content: center;
//     align-items: center;
// }

// .ai .profile {
//     background: #10a37f;
// }
