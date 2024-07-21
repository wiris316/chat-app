const UserLegend = (props) => {
  const { userLegendInfo } = props;
  return (
    <section id="user-legend">
      <h3 id="user-legend-header">Chatters in the room</h3>
      <ul>
        {userLegendInfo.map((user, i) => (
          <li key={i}>{`${Object.keys(user)[0]} - ${
            Object.values(user)[0]
          }`}</li>
        ))}
      </ul>
    </section>
  );
};

export default UserLegend;
