
const SecurityNotice = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
      <h4 className="font-semibold text-blue-800 mb-2">Security Notice</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Your request will be reviewed by existing administrators</li>
        <li>• After approval, you can sign in with your credentials.</li>
        <li>• All registration attempts are logged for security purposes.</li>
      </ul>
    </div>
  );
};

export default SecurityNotice;
