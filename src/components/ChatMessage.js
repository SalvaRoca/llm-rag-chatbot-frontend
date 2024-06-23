import '../styles/ChatMessage.css';
import ReactMarkdown from 'react-markdown';


export const ChatMessage = ({message}) => {
    return (
        <>
            <div className={`message ${message.author === 'Usuario' ? 'message-user' : 'message-bot'}`}>
                <ReactMarkdown>
                    {message.text}
                </ReactMarkdown>
            </div>
            <p className={`message ${message.author === 'Usuario' ? 'message-footer-user' : 'message-footer-bot'}`}>
                {message.timestamp}
            </p>
        </>
    );
}