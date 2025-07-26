Basic Structure
import Company from '../models/company-model.js'
const companiesCltr = {}

// code comes here

export default companiesCltr
=========================================================
FETCH ALL RECORDS
companiesCltr.list = async (req, res) => {
    try {
        const companies = await Company.find({}); // Fetch all companies
        console.log('Fetched companies:', companies); // Log the fetched companies for debugging
        return res.status(200).json(companies); // Respond with the list of companies
    } catch (error) {
        console.error('Error fetching companies:', error); // Log the error with context
        return res.status(500).json({ error: 'Something went wrong' }); // Respond with an error message
    }
};

=========================================================
FETCH A PARTICULAR RECORD

contextsCltr.show = async (req, res) => {
    const contextId = req.params.id; // Get the context ID from the request parameters

    // Validate context ID
    if (!contextId) {
        return res.status(400).json({ message: 'Context ID is required' });
    }

    try {
        const context = await Context.findById(contextId); // Find the context by ID

        if (!context) {
            return res.status(404).json({ message: 'Context not found' }); // Return 404 if not found
        }

        console.log('Fetched context:', context); // Log the context for debugging
        return res.status(200).json(context); // Send the found context as the response
    } catch (error) {
        console.error('Error fetching context:', error); // Log the error with context
        return res.status(500).json({ message: 'Server error', error: error.message }); // Return error message
    }
};

=========================================================
CREATE A RECORD

companiesCltr.create = async (req, res) => {
    const companyData = req.body; // Extract the data from the request body

    try {
        const company = new Company(companyData); // Create a new company instance
        await company.save(); // Save the company to the database

        return res.status(201).json(company); // Respond with the created company
    } catch (error) {
        console.error('Error creating company:', error); // Log the error with context
        return res.status(500).json({ error: 'Something went wrong' }); // Respond with an error message
    }
};


=========================================================
UPDATE A RECORD

companiesCltr.update = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedCompany = await Company.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found' });
        }

        return res.json(updatedCompany);
    } catch (error) {
        console.error('Error updating company:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

=========================================================
DELETE A RECORD

companiesCltr.delete = async (req, res) => {
    const { id } = req.params; // Extract the company ID from request parameters

    try {
        const deletedCompany = await Company.findByIdAndDelete(id); // Attempt to delete the company by ID

        if (!deletedCompany) {
            return res.status(404).json({ message: 'Company not found' }); // Return 404 if the company does not exist
        }

        return res.status(200).json(deletedCompany); // Respond with the deleted company details
    } catch (error) {
        console.error('Error deleting company:', error); // Log the error with context
        return res.status(500).json({ error: 'Something went wrong' }); // Return a generic error message
    }
};

=========================================================
WHILE SAVING A RECORD, QUERY ANOTHER TABLE AND UPDATE THE ID IN THAT TABLE AS WELL

// for updating postId in context when a post is saved
    
    contextsCltr.updatePostId = async (req, res) => {
    const { postId, includeInContainer } = req.body; // postId and includeInContainer being sent in the request body
    const { contextId } = req.params; // contextId from the URL params

    try {
        // Ensure contextId, postId, and includeInContainer are provided
        if (!contextId || !postId) {
            return res.status(400).json({ message: 'Context ID, Post ID, and includeInContainer are required.' });
        }

        // Use the $push operator to add the new post object to the posts array
        const updatedContext = await Context.findByIdAndUpdate(
            contextId, // Find the context by its ID
            { $push: { posts: { postId, includeInContainer } } }, // Push the new post object into the posts array
            { new: true, useFindAndModify: false } // Return the updated document
        );

        // Check if the context was found and updated
        if (!updatedContext) {
            return res.status(404).json({ message: 'Context not found.' });
        }

        // Respond with the updated context
        res.status(200).json({ message: 'Post ID added successfully', updatedContext });
    } catch (error) {
        console.error('Error updating context with postId:', error);
        res.status(500).json({ message: 'An error occurred while updating the context.' });
    }
}; 