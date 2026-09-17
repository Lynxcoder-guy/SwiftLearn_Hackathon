import subjects from './SwiftMaterials/SwiftSubjects.json';
import { useNavigate, useParams } from 'react-router-dom';
import './Swift.css';

export default function SwiftContents() {

  const navigate = useNavigate();
  const { userId } = useParams();
  const handleClick = (materialId) => {
    // Preserve each subject's hint setting in the route so the quiz can offer
    // support without changing the underlying question bank.
    const hintValue = subjects[materialId]['with-hint?'];
    navigate(`/dashboard/${userId}/swiftcontents/${materialId}?hint=${hintValue}`)
  };

  return (
    <div className="swift-page">
      <div className="swift-topics-hero">
        <h1>Swift Math</h1>
        <h3>Learn Math Interactively With Swift</h3>
      </div>
      <section className="swift-topics-materials">
        {Object.entries(subjects).map(([key, subject]) => (
          <div key={key} className="topic-card">
            <h2>{subject.title}</h2>
            <p>{subject.description}</p>
            <button className="topic-card-button" onClick={() => handleClick(key)}>Learn This</button>
          </div>
        ))}
        </section>
        <div className="swift-topic-coming-soon">
          <h2>Coming Soon</h2>
          <p>Building Swift require a lot of effort and time so these are all of the available
            learning materials for now we wish to deliver more subjects in the future, if you want
            to study or memorize materials we havent created yet you can try our other system <strong>Scope</strong> 
            for memorizing materials effectively so okay have fun learning.
          </p>
        </div>
    </div>
  )
}
