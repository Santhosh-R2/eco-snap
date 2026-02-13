const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendCollectionScheduledEmail = async (userEmail, userName, scheduledDate, employeeName) => {
    try {
        const formattedDate = new Date(scheduledDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Waste Collection Scheduled - Ecosnap',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2ecc71;">✅ Waste Collection Scheduled!</h2>
                    <p>Dear <strong>${userName}</strong>,</p>
                    
                    <p>Your waste collection has been successfully scheduled.</p>
                    
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Collection Details:</h3>
                        <p><strong>📅 Scheduled Date:</strong> ${formattedDate}</p>
                        <p><strong>👷 Assigned Employee:</strong> ${employeeName}</p>
                    </div>
                    
                    <p><strong>Important Instructions:</strong></p>
                    <ul>
                        <li>Please ensure your waste is properly segregated (plastic/glass)</li>
                        <li>Keep the waste accessible for collection</li>
                        <li>Be available at the scheduled time if possible</li>
                    </ul>
                    
                    <p>Thank you for using Ecosnap!</p>
                    
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #888; font-size: 12px;">
                        This is an automated email. Please do not reply to this message.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

const sendCollectionReminderEmail = async (userEmail, userName, employeeName, employeeId) => {
    try {
        const today = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: '🔔 Waste Collection Today - Ecosnap',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">🔔 Collection Reminder - TODAY!</h2>
                    <p>Dear <strong>${userName}</strong>,</p>
                    
                    <p style="font-size: 18px; color: #e74c3c;"><strong>Your waste collection is scheduled for TODAY!</strong></p>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Collection Agent Details:</h3>
                        <p><strong>👷 Employee Name:</strong> ${employeeName}</p>
                        <p><strong>🆔 Employee ID:</strong> ${employeeId}</p>
                        <p><strong>📅 Collection Date:</strong> ${today}</p>
                    </div>
                    
                    <p><strong>⚠️ Please ensure:</strong></p>
                    <ul>
                        <li>Your waste is ready and accessible</li>
                        <li>Waste is properly segregated (plastic/glass)</li>
                        <li>Someone is available to hand over the waste</li>
                    </ul>
                    
                    <p>Thank you for your cooperation!</p>
                    
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #888; font-size: 12px;">
                        This is an automated reminder. Please do not reply to this message.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending reminder email:', error);
        return { success: false, error: error.message };
    }
};

const sendAdminTaskReminderEmail = async (adminEmail, tasks) => {
    try {
        const taskRows = tasks.map(task => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${task.type}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${task.employeeName}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${task.status}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: 'Daily Task Overview - Ecosnap Admin',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">📋 Daily Task Summary</h2>
                    <p>Hello Admin,</p>
                    <p>Here are the tasks scheduled for collection today:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Type</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Assigned To</th>
                                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${taskRows}
                        </tbody>
                    </table>
                    
                    <p>Please monitor the progress through the dashboard.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;">
                    <p style="color: #888; font-size: 12px;">Automated system report.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Admin reminder email sent:', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending admin email:', error);
        return { success: false, error: error.message };
    }
};

const sendDonationReminderToUserEmail = async (userEmail, userName, itemType) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: '🔔 Donation Collection Reminder - Ecosnap',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2ecc71;">🎁 Donation Collection Today!</h2>
                    <p>Dear <strong>${userName}</strong>,</p>
                    <p>This is a reminder that your donation of <strong>${itemType}</strong> is scheduled for collection today.</p>
                    <p>Our team member will be arriving to collect the item. Please ensure someone is available.</p>
                    <p>Thank you for your generous contribution to a cleaner environment!</p>
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #888; font-size: 12px;">This is an automated reminder.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('User donation reminder sent:', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending user donation reminder:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendCollectionScheduledEmail,
    sendCollectionReminderEmail,
    sendAdminTaskReminderEmail,
    sendDonationReminderToUserEmail
};
