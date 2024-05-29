import '../styles/ChatMessage.css';

export const ChatMessage = ({message}) => {
    return (
        <>
            <div className={`message ${message.author === 'Usuario' ? 'message-user' : 'message-bot'}`}>
                <p>{message.text}</p>
            </div>
            <p className={`message ${message.author === 'Usuario' ? 'message-footer-user' : 'message-footer-bot'}`}>
                {message.timestamp}
            </p>
        </>
    );
}