function Stepper({ step }) {
  const steps = ['Register', 'Verify OTP', 'Login'];

  return (
    <div className="flex justify-between mb-6">
      {steps.map((s, index) => (
        <div key={index} className={`flex-1 text-center ${step > index + 1 ? 'text-green-500' : step === index + 1 ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          {s}
        </div>
      ))}
    </div>
  );
}

export default Stepper;