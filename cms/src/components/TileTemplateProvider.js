import React, { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';
import TileTemplateContext from '../context/TileTemplateContext';

export const TileTemplateProvider = ({ children }) => {
    const [tileTemplates, setTileTemplates] = useState([]);

    const fetchTileTemplates = useCallback(async () => {
        try {
            const response = await axios.get('/api/admin/tile-templates', {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });
            setTileTemplates(response.data);
        } catch (error) {
            console.error('Failed to fetch tile templates:', error);
        }
    }, []);

    useEffect(() => {
        fetchTileTemplates();
    }, [fetchTileTemplates]);

    const addTileTemplate = async (templateData) => {
        try {
            const response = await axios.post('/api/admin/tile-templates', templateData, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });
            setTileTemplates([...tileTemplates, response.data]);
            return response.data;
        } catch (error) {
            console.error('Failed to add tile template:', error);
            throw error;
        }
    };

    const updateTileTemplate = async (id, templateData) => {
        try {
            const response = await axios.put(`/api/admin/tile-templates/${id}`, templateData, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });
            setTileTemplates(
                tileTemplates.map((template) =>
                    template._id === id ? response.data : template
                )
            );
            return response.data;
        } catch (error) {
            console.error('Failed to update tile template:', error);
            throw error;
        }
    };

    const deleteTileTemplate = async (id) => {
        try {
            await axios.delete(`/api/admin/tile-templates/${id}`, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });
            setTileTemplates(tileTemplates.filter((template) => template._id !== id));
        } catch (error) {
            console.error('Failed to delete tile template:', error);
            throw error;
        }
    };

    return (
        <TileTemplateContext.Provider
            value={{
                tileTemplates,
                fetchTileTemplates,
                addTileTemplate,
                updateTileTemplate,
                deleteTileTemplate,
            }}
        >
            {children}
        </TileTemplateContext.Provider>
    );
}; 