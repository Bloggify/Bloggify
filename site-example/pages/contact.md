If you have any questions, just send me a message. If you just want to say "Hi", that's cool too.

<form class="contact-form" action="/contact" method="POST">
    <input type="hidden" name="formId" value="contact">
    <table>
        <tbody>
            <tr>
                <td>Name:</td>
                <td><input type="text" name="name"></td>
            </tr>
            <tr>
                <td>Email Address</td>
                <td><input type="email" name="email"></td>
            </tr>
            <tr>
                <td>Subject</td>
                <td><input type="text" name="subject"></td>
            </tr>
            <tr>
                <td>Message</td>
                <td><textarea name="message"></textarea></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="submit" value="Send"></td>
            </tr>
        </tbody>
    </table>
</form>
