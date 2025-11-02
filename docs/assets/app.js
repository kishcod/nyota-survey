// Simple form submission to simulate eligibility logic
document.getElementById('surveyForm').addEventListener('submit', function(evt){
  evt.preventDefault();
  const form = evt.target;
  const data = {
    name: form.name.value,
    phone: form.phone.value,
    business: form.business.value,
    revenue: Number(form.revenue.value)
  };

  // Simple eligibility rule: revenue less than 300000 -> qualify (example)
  const qualifies = data.revenue < 300000;
  if (qualifies) {
    // Save to localStorage then redirect to grant page
    localStorage.setItem('nyotaApplicant', JSON.stringify(data));
    window.location.href = 'grant.html';
  } else {
    alert('Based on the survey you are not eligible for this round. Try next time.');
  }
});