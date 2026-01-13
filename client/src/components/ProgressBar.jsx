const ProgressBar = ({ progress, color = "bg-blue-600" }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div 
        className={`${color} h-2.5 rounded-full transition-all duration-500`} 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;