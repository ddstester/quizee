import React, { useState } from 'react';

const QuestionForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    questionText: initialData?.questionText || '',
    options: initialData?.options || ['', '', '', ''],
    correctAnswer: initialData?.correctAnswer || 0
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    formData.options.forEach((option, index) => {
      if (!option.trim()) {
        newErrors[`option${index}`] = `Option ${index + 1} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <textarea
          name="questionText"
          value={formData.questionText}
          onChange={handleInputChange}
          rows={3}
          className={`form-input ${errors.questionText ? 'border-red-500' : ''}`}
          placeholder="Enter your question here..."
        />
        {errors.questionText && (
          <p className="mt-1 text-sm text-red-600">{errors.questionText}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options
        </label>
        {formData.options.map((option, index) => (
          <div key={index} className="mb-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="correctAnswer"
                value={index}
                checked={formData.correctAnswer === index}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  correctAnswer: parseInt(e.target.value)
                }))}
                className="text-blue-600"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`form-input flex-1 ${errors[`option${index}`] ? 'border-red-500' : ''}`}
                placeholder={`Option ${index + 1}`}
              />
            </div>
            {errors[`option${index}`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`option${index}`]}</p>
            )}
          </div>
        ))}
        <p className="text-sm text-gray-500 mt-2">
          Select the radio button next to the correct answer
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="btn-primary"
        >
          {initialData ? 'Update Question' : 'Add Question'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
