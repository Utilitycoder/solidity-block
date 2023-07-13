import React from "react"
import { Paper, Typography, Container } from "@material-ui/core"
import ImageList from '@material-ui/core/ImageList'
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import code1 from '../../assets/code1.png'
import code2 from '../../assets/code2.png'
import screen1 from '../../assets/screen1.png'
import screen2 from '../../assets/screen2.png'
import screen3 from '../../assets/screen3.png'
import useStyles from "./styles"


const Sample = () => {
    const classes = useStyles()


    return (
        <Container className={classes.container} maxWidth="lg">
            <Paper>
                <ImageList cols={1} rowHeight={500} gap={12}>
                        {sampleBlocks.map((item) => (
                            <ImageListItem key={item.img}>
                            <Typography>{item.title}</Typography>
                            <img
                                className={classes.image}
                                src={item.img}
                                srcSet={item.img}
                                alt={item.title}
                                loading="lazy"
                            />
                            <ImageListItemBar
                                title={item.title}
                                position="below"
                            />
                            </ImageListItem>
                        ))}
                </ImageList>
                <ImageList cols={1} rowHeight={800} gap={22}>
                        {sampleCode.map((item) => (
                        <ImageListItem key={item.img}>
                            <img
                                className={classes.image}
                                src={item.img}
                                srcSet={item.img}
                                alt={item.title}
                                loading="lazy"
                            />
                         </ImageListItem>
                        ))}
                </ImageList>
            </Paper>
        </Container>
    )
}

const sampleBlocks = [
    {
        img: `${screen1}`,
        title: 'Code Block 1',
    },
    {
        img: `${screen2}`,
        title: 'Code Block 2',
    },
    {
        img: `${screen3}`,
        title: 'Code Block 3',
    },
]

const sampleCode = [
    {
        img: `${code1}`,
        title: 'Code Output 1',
    },
    {
        img: `${code2}`,
        title: 'Code Output 2',
    },
]

export default Sample


