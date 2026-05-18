import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#334155';
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(char => char + char).join('');
    }
    const r = parseInt(hexcolor.substring(0, 2), 16);
    const g = parseInt(hexcolor.substring(2, 4), 16);
    const b = parseInt(hexcolor.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#334155' : '#FFFFFF';
};

export const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
};

export const adjustBrightness = (hex, percent) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = parseInt(r * (100 + percent) / 100);
    g = parseInt(g * (100 + percent) / 100);
    b = parseInt(b * (100 + percent) / 100);

    r = (r < 255) ? r : 255;
    g = (g < 255) ? g : 255;
    b = (b < 255) ? b : 255;

    r = Math.round(r).toString(16).padStart(2, '0');
    g = Math.round(g).toString(16).padStart(2, '0');
    b = Math.round(b).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
};

export const setAppColors = (primaryColor) => {
    if (!primaryColor) return;
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary-text', getContrastYIQ(primaryColor));
    
    // Calcula um hover (escurece 15% se for claro, clareia 15% se for escuro para garantir que haja um hover perceptível)
    const yiq = getContrastYIQ(primaryColor);
    const hoverColor = yiq === '#334155' ? adjustBrightness(primaryColor, -15) : adjustBrightness(primaryColor, 15);
    document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
    
    // Configura o RGB para usar com rgba() em focos e sombras
    document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(primaryColor));
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('liblink_token');
            if (token) {
                try {
                    const response = await api.get('/user');
                    setUser(response.data);
                    
                    // fetch school as well
                    const schoolRes = await api.get('/settings/school');
                    setSchool(schoolRes.data);
                    
                    if (schoolRes.data?.primary_color) {
                        setAppColors(schoolRes.data.primary_color);
                    }
                } catch (error) {
                    console.error('Error loading user:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        localStorage.setItem('liblink_token', response.data.access_token);
        setUser(response.data.user);
        
        const schoolRes = await api.get('/settings/school');
        setSchool(schoolRes.data);
        if (schoolRes.data?.primary_color) {
            setAppColors(schoolRes.data.primary_color);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout error', e);
        }
        localStorage.removeItem('liblink_token');
        setUser(null);
        setSchool(null);
        document.documentElement.style.removeProperty('--color-primary');
        document.documentElement.style.removeProperty('--color-primary-text');
        document.documentElement.style.removeProperty('--color-primary-hover');
        document.documentElement.style.removeProperty('--color-primary-rgb');
    };

    return (
        <AuthContext.Provider value={{ user, school, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
