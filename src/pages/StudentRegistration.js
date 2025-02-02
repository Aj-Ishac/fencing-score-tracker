import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function StudentRegistration() {
  const navigate = useNavigate();
  const { fencers, addFencer, addMultipleFencers, loading, error } = useData();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    level: 'Beginner'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addFencer(formData);
      setFormData({
        name: '',
        age: '',
        level: 'Beginner'
      });
    } catch (err) {
      console.error('Error adding fencer:', err);
    }
  };

  const generateTenDummyStudents = async () => {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Drew', 'Avery', 'Quinn'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    try {
      const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
      
      const dummyFencers = Array.from({ length: 10 }, () => ({
        name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
        age: Math.floor(Math.random() * (30 - 15) + 15).toString(),
        level: getRandomItem(levels)
      }));

      await addMultipleFencers(dummyFencers);
    } catch (err) {
      console.error('Error generating dummy students:', err);
    }
  };

  const handleFencerClick = (fencerId) => {
    navigate(`/statistics?fencer=${fencerId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4 text-airbnb-foggy font-airbnb">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-airbnb-rausch bg-red-50 rounded-airbnb font-airbnb">Error: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-airbnb">
      <h1 className="text-airbnb-hof text-3xl font-bold mb-6">Student Registration</h1>
      
      <div className="bg-airbnb-rausch/10 text-airbnb-hof p-4 rounded-airbnb mb-8 font-medium">
        Registered Students: {fencers.length}
      </div>

      <div className="bg-white p-6 rounded-airbnb shadow-airbnb hover:shadow-airbnb-hover transition-shadow duration-200 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-airbnb-hof text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-airbnb-hof text-sm font-medium">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="100"
              className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof placeholder-airbnb-foggy focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-airbnb-hof text-sm font-medium">
              Experience Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-airbnb text-airbnb-hof focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu outline-none transition appearance-none bg-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex gap-3 w-full mt-8">
            <button 
              type="submit" 
              disabled={loading}
              className="w-[80%] px-6 py-3 bg-airbnb-rausch text-white rounded-airbnb hover:bg-airbnb-rausch/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Register Student
            </button>
            <button
              type="button"
              onClick={generateTenDummyStudents}
              disabled={loading}
              className="w-[20%] px-2 py-3 bg-white border border-airbnb-hof text-airbnb-hof rounded-airbnb hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Generate 10 Dummy Students
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-airbnb shadow-airbnb">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-airbnb-hof">Registered Fencers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fencers.map(fencer => (
                <tr key={fencer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-airbnb-babu font-mono">#{fencer.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleFencerClick(fencer.id)}
                      className="text-airbnb-hof hover:text-airbnb-babu font-medium transition-colors"
                    >
                      {fencer.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                    {fencer.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                    {fencer.level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentRegistration; 