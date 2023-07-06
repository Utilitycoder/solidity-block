import React from 'react';
import { Grid, Paper, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';

import Contract from './contract/contract';
import useStyles from './styles';

// Retrieve contracts from state and filter it to display contracts saved by the current user.
const Posts = ({ setCurrentId }) => {
  const contracts = useSelector((state) => state.contracts);
  const classes = useStyles();
  const user = JSON.parse(localStorage.getItem('profile'));
  
  const userId = user?.result?.sub ? user?.result?.sub : user?.result?._id

  const userContracts = contracts.filter(element => element.creator === userId); 

  return (
    !userContracts.length ? (
      <Paper className={`${classes.paper}`}>
        <Typography variant="h6" align="center" color='primary'>
            {user?.result?._id ? "Click the button above to save your code." : <a className={classes.post} href='/auth'>Please sign in to save your code.</a>}
        </Typography>
      </Paper>
    ) : (
      <Grid className={classes.container} container alignItems="stretch" spacing={3}>
        {userContracts.map((contract) => (
          <Grid key={contract._id} item xs={12} sm={6} md={6}>
            <Contract contract={contract} setCurrentId={setCurrentId} />
          </Grid>
        ))}
      </Grid>
    )
  );
};

export default Posts;
