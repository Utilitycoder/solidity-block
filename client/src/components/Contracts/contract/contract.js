import React from "react"
import { Card, CardActions, CardContent, Button, Typography } from "@material-ui/core/"
import DeleteIcon from "@material-ui/icons/Delete"
import { useDispatch } from "react-redux"
import  { saveAs } from 'file-saver'
import { deleteContract } from "../../../actions/contracts"
import useStyles from "./styles"
import {ReactComponent as RemixIcon} from "./Icons/RemixIcon.svg"
import {ReactComponent as DownloadIcon} from "./Icons/DownloadIcon.svg" 

const Contract = ({ contract, setCurrentId }) => {
    const dispatch = useDispatch()
    const classes = useStyles()

    const base64_encode = (code) => {      
        return btoa(unescape(encodeURIComponent(code)));
    }

    const remixURL = (code) => {
        const remix = new URL('https://remix.ethereum.org');
        remix.searchParams.set('code', base64_encode(code).replace(/=*$/, ''));
        return remix;
    }

    const remixHandler = async (contractCode) => {
        const code = String(contractCode)
        window.open(remixURL(code).toString(), '_blank');
    };

    const downloadHandler = async (contract) => {
        const blob = new Blob([contract.code], { type: 'text/plain' });
          saveAs(blob, contract.title + '.sol');
      };


    return (
        <Card className={classes.card}>
            <Typography className={classes.title} gutterBottom variant="h5" component="h2">
                {contract.title}
            </Typography>
            <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">{contract.code}</Typography>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <Button
                    size="small"
                    color="primary"
                    onClick={() => dispatch(deleteContract(contract._id))}
                >
                    <DeleteIcon fontSize="small" /> Delete
                </Button>
                <Button
                    size="small"
                    color="primary"
                    onClick={() => downloadHandler(contract)}
                >
                    <DownloadIcon fontSize="small" />&nbsp;Download
                </Button>
                <Button
                    size="small"
                    color="primary"
                    onClick={() => remixHandler(contract.code)}
                    >
                    <RemixIcon />&nbsp;Open in Remix
                </Button>
            </CardActions>
        </Card>
    )
}

export default Contract
