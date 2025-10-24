document.getElementById('surveyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {};
  fd.forEach((v,k) => obj[k] = v);
  const resp = await fetch('/https://nyota-survey-1.onrender.com', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(obj)
  });
  const data = await resp.json();
  if (data.ok) {
    // go to qualified page
    location.href = '/qualified.html';
  } else {
    alert('Error saving survey');
  }
});
