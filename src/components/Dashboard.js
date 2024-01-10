import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, Drawer as MuiDrawer } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import FolderIcon from '@mui/icons-material/Folder';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

function Dashboard() {
    const [folders, setFolders] = useState([
        { id: 1, name: 'Dossier 1' },
        { id: 2, name: 'Dossier 2' }
    ]);

    function handleAddFolder() {
        const newFolder = {
            id: folders.length + 1,
            name: `Dossier ${folders.length + 1}`
        };
        setFolders([...folders, newFolder]);
    }

    function handleDeleteFolder(folderId) {
        setFolders(folders.filter(folder => folder.id !== folderId));
    }

    const [renamingFolder, setRenamingFolder] = useState(null);

    function handleRenameFolder(folderId, newName) {
        setFolders(folders.map(folder => {
            if (folder.id === folderId) {
                return { ...folder, name: newName };
            }
            return folder;
        }));
        setRenamingFolder(null);
    }

    const drawerWidth = 277;

    const Drawer = styled(MuiDrawer, {
        shouldForwardProp: (prop) => prop !== 'open',
    })(({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    }));

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, marginLeft: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)` }}>
                <Toolbar>
                    <Typography variant="h6" noWrap>
                        Toolly Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent">
                <List>
                    {folders.map((folder) => (
                        <ListItem button key={folder.id} component={Link} to={`/${folder.id}`}>
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary={folder.name} />
                            <ListItemIcon onClick={() => setRenamingFolder(folder)}>
                                <EditIcon />
                            </ListItemIcon>
                            <ListItemIcon onClick={() => handleDeleteFolder(folder.id)}>
                                <DeleteIcon />
                            </ListItemIcon>
                        </ListItem>
                    ))}
                    <ListItem button onClick={handleAddFolder}>
                        <ListItemIcon>
                            <AddBoxIcon />
                        </ListItemIcon>
                        <ListItemText primary="Créer un nouveau dossier" />
                    </ListItem>
                </List>
            </Drawer>
            <Dialog open={Boolean(renamingFolder)} onClose={() => setRenamingFolder(null)}>
                <DialogTitle>{"Renommer le dossier"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Nouveau nom du dossier"
                        type="text"
                        fullWidth
                        variant="outlined"
                        defaultValue={renamingFolder ? renamingFolder.name : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenamingFolder(null)}>Annuler</Button>
                    <Button onClick={() => handleRenameFolder(renamingFolder.id, document.getElementById('name').value)}>Renommer</Button>
                </DialogActions>
            </Dialog>

            <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: `${drawerWidth}px` }}>
                <Routes>
                    {folders.map((folder) => (
                        <Route key={folder.id} path={`/${folder.id}`} element={<Typography paragraph>Contenu du dossier: {folder.name}</Typography>} />
                    ))}
                </Routes>
            </Box>
        </Box>
    );
}

export default Dashboard;