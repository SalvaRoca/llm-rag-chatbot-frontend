import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import {FileUpload} from 'primereact/fileupload';
import {Tooltip} from "primereact/tooltip";
import {Toast} from 'primereact/toast';
import {Tag} from 'primereact/tag';
import {useState, useRef} from "react";
import {SelectButton} from "primereact/selectbutton";
import {InputTextarea} from "primereact/inputtextarea";
import {Menubar} from "primereact/menubar";
import {ChatMessage} from "./components/ChatMessage";


export const App = () => {
    const [visible, setVisible] = useState(false);
    const [totalSize, setTotalSize] = useState(0);
    const [llm, setLlm] = useState('mistral');
    const [rag, setRag] = useState('langchain');
    const [queryText, setQueryText] = useState('');
    const [messages, setMessages] = useState([]);
    const toast = useRef(null);
    const fileUploadRef = useRef(null);

    const llmOptions = [
        { label: 'Mistral', value: 'mistral' },
        { label: 'Llama 3', value: 'llama' }
    ];

    const ragOptions = [
        { label: 'LangChain', value: 'langchain' },
        { label: 'LlamaIndex', value: 'llamaindex' }
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

    const onSelect = (e) => {
        let _totalSize = totalSize;
        let files = e.files;

        Object.keys(files).forEach((key) => {
            _totalSize += files[key].size || 0;
        });

        setTotalSize(_totalSize);
    };

    const onUpload = (e) => {
        let _totalSize = 0;

        e.files.forEach((file) => {
            _totalSize += file.size || 0;
        });

        setTotalSize(_totalSize);
        setVisible(false);
        toast.current.show({severity: 'info', summary: 'Info', detail: 'Modelo cargado'});
    };

    const onRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        callback();
    };

    const onError = () => {
        setTotalSize(0);
        toast.current.show({severity: 'error', summary: 'Error', detail: 'Error al cargar el modelo'});

    };

    const onClear = () => {
        setTotalSize(0);
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
                <div className="flex align-items-center" style={{width: '40%'}}>
                    <img alt={file.name} role="presentation" src={file.objectURL} width={100}/>
                    <span className="flex flex-column text-left ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag value={props.formatSize} severity="warning" className="px-3 py-2"/>
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

    const handleSubmit = () => {
        if (queryText.trim()) {
            setMessages([...messages, {
                author: 'Usuario',
                text: queryText,
                timestamp: new Date().toLocaleString()
            }]);
            setQueryText('');
        }
    };

    return (
        <>
            <Menubar model={menuItems} className="surface-ground"/>
            <Toast ref={toast}></Toast>

            <div>
                {messages.map((message, index) => (
                    <ChatMessage message={message} key={index} />
                ))}
            </div>

            <div
                className="surface-ground px-2 py-2 fixed bottom-0 left-0 right-0 flex justify-content-center align-items-center gap-2">
                <InputTextarea autoResize value={queryText}
                               onChange={(e) => setQueryText(e.target.value)}
                               onKeyDown={handleKeyDown}
                               rows={1}
                               className="border-primary w-full justify-content-end"/>
                <Button icon="pi pi-send" label="Enviar" onClick={handleSubmit}/>
            </div>

            <Dialog header="Subir archivos al modelo" style={{width: '50vw'}} visible={visible}
                    onHide={() => setVisible(false)} footer={footerContent}>


                <Tooltip target=".custom-choose-btn" content="Explorar" position="bottom"/>
                <Tooltip target=".custom-upload-btn" content="Cargar" position="bottom"/>
                <Tooltip target=".custom-cancel-btn" content="Vaciar" position="bottom"/>

                <FileUpload ref={fileUploadRef} name="files" url="http://127.0.0.1:5000/upload" multiple
                            accept="application/pdf"
                            onUpload={onUpload} onSelect={onSelect} onError={onError} onClear={onClear}
                            headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
                            chooseOptions={chooseOptions} uploadOptions={uploadOptions} cancelOptions={cancelOptions}/>
            </Dialog>
        </>
    );
}

export default App;
