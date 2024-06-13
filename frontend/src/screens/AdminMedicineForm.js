import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminMedicineForm = () => {
  const [medicineData, setMedicineData] = useState({
    category: '',
    subcategory: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: null
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategoryId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/categories/${selectedCategoryId}/subcategories`);
          setSubcategories(response.data);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      }
    };

    fetchSubcategories();
  }, [selectedCategoryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicineData({ ...medicineData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategoryId(e.target.value);
  };

  const handleImageChange = (e) => {
    setMedicineData({ ...medicineData, image: e.target.files[0] });
  };

  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:5000/api/categories', { name: newCategory }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNewCategory('');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error adding category:', error);
      setShowErrorAlert(true);
    }
  };

  const handleAddSubcategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`http://localhost:5000/api/subcategories/${selectedCategoryId}`, { name: newSubcategory }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNewSubcategory('');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      setShowErrorAlert(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', medicineData.image);
      formData.append('category', selectedCategoryId);
      formData.append('subcategory', selectedSubcategoryId);
      formData.append('name', medicineData.name);
      formData.append('description', medicineData.description);
      formData.append('price', medicineData.price);
      formData.append('quantity', medicineData.quantity);

      await axios.post('http://localhost:5000/api/medicines', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMedicineData({
        category: '',
        subcategory: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        image: null
      });
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error adding medicine:', error);
      setShowErrorAlert(true);
    }
  };

  return (
    <div className="container">
      <h2>Add Medicine</h2>
      <div className="row">
        <div className="col-md-6">
          <label>Category:</label>
          <select className="form-control" name="category" value={selectedCategoryId} onChange={handleCategoryChange} required>
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          <input className="form-control mt-2" type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category" />
          <button className="btn btn-primary mt-2" type="button" onClick={handleAddCategory}>Add Category</button>
        </div>
        <div className="col-md-6">
          <label>Subcategory:</label>
          <select className="form-control" name="subcategory" value={selectedSubcategoryId} onChange={handleSubcategoryChange} required>
            <option value="">Select Subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
            ))}
          </select>
          <input className="form-control mt-2" type="text" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="New Subcategory" />
          <button className="btn btn-primary mt-2" type="button" onClick={handleAddSubcategory}>Add Subcategory</button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <label>Image:</label>
            <input className="form-control" type="file" accept="image/*" onChange={handleImageChange} required />
          </div>
          <div className="col-md-6">
            <label>Name:</label>
            <input className="form-control" type="text" name="name" value={medicineData.name} onChange={handleChange} required />
            </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <label>Description:</label>
            <textarea className="form-control" name="description" value={medicineData.description} onChange={handleChange}></textarea>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <label>Price:</label>
            <input className="form-control" type="number" name="price" value={medicineData.price} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label>Quantity:</label>
            <input className="form-control" type="number" name="quantity" value={medicineData.quantity} onChange={handleChange} required />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-12">
            <button className="btn btn-primary" type="submit">Add Medicine</button>
          </div>
        </div>
      </form>
      {showSuccessAlert && (
        <div className="alert alert-success mt-3" role="alert">
          Medicine added successfully!
        </div>
      )}
      {showErrorAlert && (
        <div className="alert alert-danger mt-3" role="alert">
          Error adding medicine. Please try again.
        </div>
      )}
    </div>
  );
};

export default AdminMedicineForm;
