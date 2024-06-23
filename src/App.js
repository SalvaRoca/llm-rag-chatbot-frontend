import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import {FileUpload} from 'primereact/fileupload';
import {Tooltip} from "primereact/tooltip";
import {Toast} from 'primereact/toast';
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {SelectButton} from "primereact/selectbutton";
import {InputTextarea} from "primereact/inputtextarea";
import {Menubar} from "primereact/menubar";
import {ChatMessage} from "./components/ChatMessage";
import {ProgressSpinner} from "primereact/progressspinner";

export const App = () => {
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [llm, setLlm] = useState('mistral');
    const [rag, setRag] = useState('langchain');
    const [queryText, setQueryText] = useState('');
    const [messages, setMessages] = useState(() => {
        const storedMessages = localStorage.getItem('messages');
        return storedMessages ? JSON.parse(storedMessages) : [];
    });
    const toast = useRef(null);
    const fileUploadRef = useRef(null);

    useEffect(() => {
        handleFetchModel();
        console.log(messages)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
            localStorage.setItem('messages', JSON.stringify(messages));
        }, [messages]
    )

    useLayoutEffect(() => {
        document.getElementById('message-container').scrollTo({
            top: document.getElementById('message-container').scrollHeight,
            behavior: 'smooth',
        });
    }, [messages]);

    const llmOptions = [
        {label: 'Mistral', value: 'mistral'},
        {label: 'Llama 3', value: 'llama'}
    ];

    const ragOptions = [
        {label: 'LangChain', value: 'langchain'},
        {label: 'LlamaIndex', value: 'llamaindex'}
    ];

    const menuItems = [
        {
            label: 'Recargar modelo',
            icon: 'pi pi-sync',
            command: () => {
                setVisible(true)
            }
        },
        {
            label: 'Borrar conversación',
            icon: 'pi pi-trash',
            command: () => {
                setMessages([])
            }
        }
    ]

    const onUpload = () => {
        setVisible(false);
        handleFetchModel();
    };

    const onRemove = (file, callback) => {
        callback();
    };

    const onError = () => {
        toast.current.show({severity: 'error', summary: 'Error', detail: 'Error al cargar el modelo'});
    };

    const headerTemplate = (options) => {
        const {className, chooseButton, uploadButton, cancelButton} = options;

        return (
            <div className={className} style={{backgroundColor: 'transparent', display: 'flex', alignItems: 'center'}}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
            </div>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{width: '90%'}}>
                    <img alt={file.name} role="presentation" src={file.objectURL} width={100}/>
                    <span className="flex flex-column text-left ml-3">
                        {file.name}
                    </span>
                </div>
                <Button type="button" icon="pi pi-times"
                        className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                        onClick={() => onRemove(file, props.onRemove)}/>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-file-pdf mt-3 p-5" style={{
                    fontSize: '5em',
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-b)',
                    color: 'var(--surface-d)'
                }}></i>

                <p style={{fontSize: '0.8em', color: 'var(--text-color-secondary)'}} className="my-5">
                    Arrastre aquí los documentos PDF que desee añadir a la base de conocimiento
                </p>
            </div>
        );
    };

    const chooseOptions = {
        icon: 'pi pi-fw pi-folder-open',
        iconOnly: true,
        className: 'custom-choose-btn p-button-rounded p-button-outlined'
    };

    const uploadOptions = {
        icon: 'pi pi-fw pi-cloud-upload',
        iconOnly: true,
        className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined'
    };

    const cancelOptions = {
        icon: 'pi pi-fw pi-times',
        iconOnly: true,
        className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'
    };

    const footerContent = (
        <div className="card flex justify-content-center">
            <SelectButton value={llm} onChange={(e) => setLlm(e.value)} options={llmOptions}
                          style={{marginRight: '2rem'}}/>
            <SelectButton value={rag} onChange={(e) => setRag(e.value)} options={ragOptions}/>
        </div>
    );

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                return;
            }
            event.preventDefault();
            handleSubmit();
        }
    };

    const fetchModel = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/models');

            if (response.ok) {
                return await response.json();
            } else if (response.status === 400) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se ha cargado ningún modelo'
                });
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ocurrió un error al obtener detalles del modelo'
                });
            }
        } catch (error) {
            throw error;
        }
    };

    const handleFetchModel = () => {
        fetchModel()
            .then(modelData => {
                if (modelData) {
                    setIsModelLoaded(true);
                    toast.current.show({
                        severity: 'info',
                        summary: 'Info',
                        detail: 'Modelo cargado: ' + modelData.llm + ' - ' + modelData.rag
                    });
                } else {
                    setIsModelLoaded(false);
                    setVisible(true);
                }
            })
            .catch(error => {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ocurrió un error al obtener detalles del modelo'
                });
                console.error('Error al obtener detalles del modelo:', error);
                setIsModelLoaded(false);
                setVisible(true);
            })
    };


    const fetchQueries = async (query) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/queries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    messages: messages
                })
            });

            if (response.ok) {
                const text = await response.text();
                return {
                    author: 'Bot',
                    text,
                    timestamp: new Date().toLocaleString()
                };
            } else {
                console.error('Error en la respuesta:', response.status, response.statusText);
            }
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = () => {
        setIsLoading(true);

        if (queryText.trim()) {
            setMessages(prevMessages => [...prevMessages, {
                author: 'Usuario',
                text: queryText,
                timestamp: new Date().toLocaleString()
            }]);

            setQueryText('');

            fetchQueries(queryText)
                .then(botMessage => {
                    setMessages(prevMessages => [...prevMessages, botMessage]);
                })
                .catch(error => {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al obtener respuesta del modelo'
                    });
                    console.error('Error al obtener respuesta del modelo:', error);
                    setIsModelLoaded(false);
                    setVisible(true);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-column">
            <Menubar model={menuItems} className="surface-ground top-0 left-0 right-0 w-full gap-2"/>
            <Toast ref={toast}></Toast>

            <div id="message-container" className="flex-grow-1 overflow-auto">
                {messages.map((message, index) => (
                    <ChatMessage message={message} key={index}/>
                ))}
            </div>

            <div
                className="surface-ground bottom-0 w-full px-2 py-2 flex justify-content-center align-items-center gap-2">
                <InputTextarea autoResize value={queryText}
                               onChange={(e) => setQueryText(e.target.value)}
                               onKeyDown={handleKeyDown}
                               rows={1}
                               className="border-primary w-full justify-content-end"/>
                <Button
                    icon={!isLoading ? "pi pi-send" : null}
                    label={!isLoading ? "Enviar" : null}
                    onClick={handleSubmit}
                    disabled={!isModelLoaded || isLoading || !queryText.trim()}
                >
                    {isLoading && <ProgressSpinner style={{width: '20px', height: '20px'}} strokeWidth="8" />}
                </Button>
            </div>
            <Dialog header="Subir archivos al modelo" style={{width: '50vw'}} visible={visible} draggable={false}
                    closable={isModelLoaded}
                    onHide={() => setVisible(false)} footer={footerContent}>

                <Tooltip target=".custom-choose-btn" content="Explorar" position="bottom"/>
                <Tooltip target=".custom-upload-btn" content="Cargar" position="bottom"/>
                <Tooltip target=".custom-cancel-btn" content="Vaciar" position="bottom"/>

                <FileUpload ref={fileUploadRef} name="files" url={`http://127.0.0.1:5000/models?llm=${llm}&rag=${rag}`}
                            multiple accept="application/pdf" onUpload={onUpload} onError={onError}
                            headerTemplate={headerTemplate} itemTemplate={itemTemplate}
                            emptyTemplate={emptyTemplate} chooseOptions={chooseOptions} uploadOptions={uploadOptions}
                            cancelOptions={cancelOptions}/>
            </Dialog>
        </div>
    );
}

export default App;
