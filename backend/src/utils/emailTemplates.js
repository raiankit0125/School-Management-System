export const newAccountTemplate = ({ name, role, email, tempPassword }) => {
  return `
    <div style="font-family: Arial; line-height: 1.5;">
      <h2>Welcome to School Management System ✅</h2>
      <p>Hello <b>${name}</b>,</p>

      <p>Your account has been created as: <b>${role}</b></p>

      <h3>Login Credentials</h3>
      <p><b>Email:</b> ${email}</p>
      <p><b>Temporary Password:</b> ${tempPassword}</p>

      <p style="color:red;"><b>Important:</b> Please change your password after first login.</p>

      <br/>
      <p>Thanks,<br/>School Admin</p>
    </div>
  `;
};
