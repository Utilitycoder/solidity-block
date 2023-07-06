
import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
  },
  paper: {
    padding: theme.spacing(2),
  },
  buttonSubmit: {
    marginBottom: 10,
    width: 'max-content',
    display: 'inline-block',
    padding: '0.75rem 1.2rem',
    borderRadius: '0.4rem',
    cursor: 'pointer',
    color: '#4db5ff',
    border: '1px solid #4db5ff',
    '&:hover' : {
      color: 'white',
      backgroundColor: 'green',
    }
  },
  textarea: {
    fontSize: 17,
    backgroundColor: "#f5f5f5",
    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
    width: "calc(54% - 10px)", 
    height: "600px",
    margin: "auto",
    color: "#282b30",
  },
  button: {
    marginTop: '2.5rem',
    display: 'flex',
    gap: '1.2rem',
    justifyContent: 'center',
  },
  btnPrimary: {
    background: 'red',
    color: 'white',
  },
  form: {
    margin: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: "calc(54% - 10px)",
    alignItems: 'center',
    marginBottom: '20px',
  },
}));
