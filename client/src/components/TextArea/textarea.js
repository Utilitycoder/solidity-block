import React, { useState, useEffect } from 'react';
import { TextField, Paper } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import CodeEditor from '@uiw/react-textarea-code-editor';
import useStyles from './styles';
import { createContract } from '../../actions/contracts';

const TextArea = ({solidityCode, currentId, setCurrentId}) => {
  const [contractCode, setContractCode] = useState({code: '', title:''});
  const dispatch = useDispatch();
  const classes = useStyles();
  const user = JSON.parse(localStorage.getItem('profile'));

  useEffect(() => {
        setContractCode({...contractCode, code: solidityCode})
  }, [solidityCode]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(createContract({...contractCode, name: user?.result.name}));
  };

  return (
    <Paper className={classes.paper}>
      <form autoComplete="off" noValidate className={`${classes.root}`} onSubmit={handleSubmit}>
        <div className={classes.form}>
          <TextField name="title" variant="outlined" label="Title" placeholder='Contract Name' fullWidth value={contractCode.title} onChange={(e) => setContractCode({ ...contractCode, title: e.target.value })} />
        </div>
      <CodeEditor
        value={contractCode.code} 
        language="sol"
        onChange={(e) => setContractCode({...contractCode, code: e.target.value})}
        padding={14}
        className={classes.textarea}
      />

        {!user?.result?.name ? null : <div className={classes.button}>
            <input type="submit" value="Save Code" className={classes.buttonSubmit} />
        </div>}
      </form>
    </Paper>
  );
};

export default TextArea