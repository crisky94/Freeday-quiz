'use client';
import { useState, useEffect } from "react";

function CreatePage() {
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    answer_a: '',
    answer_b: '',
    answer_c: '',
    answer_d: '',
    respuesta_correcta: 'Eliga respuesta correcta', // Asumiendo que la respuesta correcta es requerida
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  const handleDelete = () => {
    setFormData({
      title: '',
      question: '',
      answer_a: '',
      answer_b: '',
      answer_c: '',
      answer_d: '',
      respuesta_correcta: 'Eliga respuesta correcta',
    });
  };

  const handleNext = () => {

  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const response = await fetch(`pages/api/games/index.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...formData }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Pregunta creada:', data);
      // Lógica adicional después de guardar la pregunta
    } else {
      console.error('Error al crear la pregunta');
    }
  };

  return (
    <div>
      <form className='flex flex-col gap-5 w-72'>
        <input type='text' placeholder='Title' name='title' value={formData.title} onChange={handleChange} className='text-black rounded-md h-10 placeholder:text-center' />
        <input type='text' placeholder='Question' name='question' value={formData.question} onChange={handleChange} className='text-black rounded-md h-12 placeholder:text-center' />
        <input type='text' placeholder='AnswerA' name='answer_a' value={formData.answer_a} onChange={handleChange} className='text-black rounded-md h-10 placeholder:text-center' />
        <input type='text' placeholder='AnswerB' name='answer_b' value={formData.answer_b} onChange={handleChange} className='text-black rounded-md h-10 placeholder:text-center' />
        <input type='text' placeholder='AnswerC' name='answer_c' value={formData.answer_c} onChange={handleChange} className='text-black rounded-md h-10 placeholder:text-center' />
        <input type='text' placeholder='AnswerD' name='answer_d' value={formData.answer_d} onChange={handleChange} className='text-black rounded-md h-10 placeholder:text-center' />
        <select name='respuesta_correcta' value={formData.respuesta_correcta} onChange={handleChange} className='text-black rounded-md h-10 text-center'>
          <option value="Eliga respuesta correcta">Eliga respuesta correcta</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <div className='flex flex-row gap-5 flex-wrap justify-center w-72'>
          <button type='button' className='bg-purple-400 text-slate-700 h-10 w-28 rounded-md ' onClick={handleDelete}>Clear</button>
          <button type='button' className='bg-purple-400 text-slate-700 h-10 w-28 rounded-md' onClick={handleNext}>Next</button>
          <button type='submit' className='bg-purple-400 text-slate-700 w-40 h-10 font-bold rounded-md' onSubmit={handleSubmit}>Save Quiz</button>
        </div>
      </form>
    </div>
  );
}

export default CreatePage;