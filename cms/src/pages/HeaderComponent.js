import {useState, useContext} from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Menu, 
    MenuItem, 
    Box,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    padding: theme.spacing(0.5, 2),
    minHeight: '48px',
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(0.5, 3),
    },
}));

const LogoText = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    letterSpacing: '1px',
    fontSize: '1.4rem',
    background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(0, 0.5),
    borderRadius: '16px',
    padding: '4px 12px',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.1),
        transform: 'translateY(-2px)',
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '12px',
        marginTop: theme.spacing(1),
        minWidth: 180,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        '& .MuiMenuItem-root': {
            padding: theme.spacing(1.5, 2),
            '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
        },
    },
}));

const HeaderComponent = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuId, setMenuId] = useState(null);
    const navigate = useNavigate();
    const { handleLogout } = useContext(AuthContext);
    const theme = useTheme();

    const handleClick = (event, id) => {
        setAnchorEl(event.currentTarget);
        setMenuId(id);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMenuId(null);
    };

    const handleMenuItemClick = (path) => {
        navigate(path);
        handleClose();
    };

    return (
        <StyledAppBar position="sticky">
            <StyledToolbar>
                <LogoText variant="h5" sx={{ flexGrow: 1 }}>
                    Veerive CMS
                </LogoText>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StyledButton 
                        color="inherit" 
                        onClick={(e) => handleClick(e, 'user-data')}
                        startIcon={<AccountCircleIcon />}
                    >
                        User Data
                    </StyledButton>
                    
                    <StyledButton 
                        color="inherit" 
                        onClick={(e) => handleClick(e, 'master-data')}
                        startIcon={<MenuIcon />}
                    >
                        Master Data
                    </StyledButton>
                    
                    <StyledButton 
                        color="inherit" 
                        onClick={() => handleMenuItemClick('/settings')}
                        startIcon={<SettingsIcon />}
                    >
                        Settings
                    </StyledButton>

                    <StyledButton 
                        color="inherit" 
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                    >
                        Logout
                    </StyledButton>
                </Box>

                {/* User Data Menu */}
                <StyledMenu
                    anchorEl={anchorEl}
                    open={menuId === 'user-data'}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={() => handleMenuItemClick('/user-details')}>
                        User Details
                    </MenuItem>
                </StyledMenu>

                {/* Master Data Menu */}
                <StyledMenu
                    anchorEl={anchorEl}
                    open={menuId === 'master-data'}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={() => handleMenuItemClick('/posts')}>Post</MenuItem>
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
                    <MenuItem onClick={() => handleMenuItemClick('/tile-templates')}>Tile Templates</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/clarification-guidance')}>Clarification Guidance</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/query-refiner')}>Query Refiner</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/market-data')}>Market Data</MenuItem>
                </StyledMenu>
            </StyledToolbar>
        </StyledAppBar>
    );
};

export default HeaderComponent;
