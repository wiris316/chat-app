const UserLegend = (props) => {
  const { userLegendInfo } = props;
  return (
    <section id="user-legend">
      <h3 id="user-legend-header">Chatters in the room</h3>
      {userLegendInfo.length > 0 ? (
        <ul>
          {userLegendInfo.map((user, i) => (
            <li key={i}>{`${Object.keys(user)[0]} - ${
              Object.values(user)[0]
            }`}</li>
          ))}
        </ul>
      ) : (
        <p>No chat history</p>
      )}
    </section>
  );
};

export default UserLegend;
