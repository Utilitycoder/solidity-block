import { makeStyles } from "@material-ui/core";

export default makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: theme.spacing(2),
    },
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
      },
    },
    container: {
      marginBottom: '100px'
    },
    image: {
      height: '100%'
    },
  }));
  