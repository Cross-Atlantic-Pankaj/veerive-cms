import {useState,  useContext} from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';


const HeaderComponent = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuId, setMenuId] = useState(null);
    const navigate = useNavigate();  // Add useNavigate hook
    //const [navigatePath, setNavigatePath] = useState(null);
    const {handleLogout} = useContext(AuthContext)

    const handleClick = (event, id) => {
        setAnchorEl(event.currentTarget);
        setMenuId(id);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMenuId(null);
    };

    const handleMenuItemClick = (path) => {
        navigate(path);  // Navigate to the specified path
        handleClose();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Veerive CMS
                </Typography>
                <Button color="inherit" onClick={(e) => handleClick(e, 'user-data')}>
                    User Data
                </Button>
                <Button color="inherit" onClick={(e) => handleClick(e, 'master-data')}>
                    Master Data
                </Button>
                <Button color="inherit" onClick={(e) => handleClick(e, 'content-data')}>
                    Content Data
                </Button>
                
                <Button color="inherit" onClick={(e) => handleMenuItemClick('/settings')}>
                    Settings
                </Button>


                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>

                {/* User Data Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={menuId === 'user-data'}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => handleMenuItemClick('/user-details')}>User Details</MenuItem>
                </Menu>

                {/* Master Data Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={menuId === 'master-data'}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => handleMenuItemClick('/contexts')}>Context</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/themes')}>Theme</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/companies')}>Company</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/sources')}>Source</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/signals')}>Business Signal</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/sub-signals')}>Business Sub-Signal</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/sectors')}>Sector</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/sub-sectors')}>Sub-Sector</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/regions')}>Region</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/countries')}>Country</MenuItem>
                    
                </Menu>

                {/* Content Data Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={menuId === 'content-data'}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => handleMenuItemClick('/posts')}>Post</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/story-order')}>Story Order</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/story-view')}>Story View</MenuItem>


                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default HeaderComponent;
