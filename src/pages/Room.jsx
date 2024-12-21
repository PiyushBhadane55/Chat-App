import React, {useState, useEffect} from 'react'
import client, { databases, DATABASES_ID, COLLECTION_ID_MESSAGES } from '../appwriteConfig'
import { ID, Query, Permission, Role} from 'appwrite';
//import Header from '../components/Header';
import { useAuth } from '../utils/AuthContext';
import {Trash2} from 'react-feather'
import Header from '../components/Header';


const Room = () => {
    const [messageBody, setMessageBody] = useState('')
    const [messages, setMessages] = useState([])
    const {user} = useAuth()


    useEffect(() => {
        getMessages();
      
        const unsubscribe = client.subscribe(`databases.${DATABASES_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, response => {

            if(response.events.includes("databases.*.collections.*.documents.*.create")){
                console.log('A MESSAGE WAS CREATED')
                setMessages(prevState => [response.payload, ...prevState])
            }

            if(response.events.includes("databases.*.collections.*.documents.*.delete")){
                console.log('A MESSAGE WAS DELETED!!!')
                setMessages(prevState => prevState.filter(message => message.$id !== response.payload.$id))
            }
        });

        console.log('unsubscribe:', unsubscribe)
      
        return () => {
          unsubscribe();
        };
      }, []);


    const getMessages = async () => {
        const response = await databases.listDocuments(
            DATABASES_ID,
            COLLECTION_ID_MESSAGES,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100),
            ]
        )
        console.log(response.documents)
        setMessages(response.documents)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('MESSAGE:', messageBody)

        const permissions = [
            Permission.write(Role.user(user.$id)),
          ]

        const payload = {
            user_id:user.$id,
            username:user.name,
            body:messageBody
        }

        const response = await databases.createDocument(
                DATABASES_ID, 
                COLLECTION_ID_MESSAGES, 
                ID.unique(), 
                payload,
                permissions
            )

        console.log('RESPONSE:', response)

        // setMessages(prevState => [response, ...prevState])

        setMessageBody('')

    }

    const deleteMessage = async (id) => {
        await databases.deleteDocument(DATABASES_ID, COLLECTION_ID_MESSAGES, id);
        //setMessages(prevState => prevState.filter(message => message.$id !== message_id))
     } 

  return (
    <main className="container">
        <Header/>
        <div className="room--container">

        <form id="message--form" onSubmit={handleSubmit}>
            <div>
                <textarea 
                    required 
                    maxlength="250"
                    placeholder="Say something..." 
                    onChange={(e) => {setMessageBody(e.target.value)}}
                    value={messageBody}
                    ></textarea>
            </div>

            <div className="send-btn--wrapper">
                <input className="btn btn--secondary" type="submit" value="send"/>
            </div>
        </form>
        
        <div>
          <div>
            {Array.isArray(messages) &&
              messages.map((message) => (
                <div key={message.$id} className="message--wrapper">
                  <div className="message--header">
                    <small className="message-timestamp">
                      {new Date(message.$createdAt).toLocaleString()}
                    </small>

                  <Trash2 
                  className="delete--btn"
                  onClick={()=>{deleteMessage(message.$id)}}/>

                    {/* <button onClick={()=>{deleteMeassage(message.$id)}}>x</button> */}
                  </div>
                  <div className="message--body">
                    <span>{message.body}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Room;
