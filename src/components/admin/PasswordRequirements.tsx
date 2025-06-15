
const PasswordRequirements = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
      <h4 className="font-semibold text-blue-800 mb-2">Password Requirements</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• At least 8 characters long</li>
        <li>• Contains uppercase letter (A-Z)</li>
        <li>• Contains lowercase letter (a-z)</li>
        <li>• Contains number (0-9)</li>
        <li>• Contains special character (!@#$%^&*)</li>
      </ul>
    </div>
  );
};

export default PasswordRequirements;
