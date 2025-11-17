function Card({ title, children }) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
      {children}
    </div>
  );
}

export default Card;