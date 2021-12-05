const container = {
  overflow: 'hidden',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'col',
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonGroup = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export default function Hello() {
  return <div style={container}>
    <div style={buttonGroup}>
      <div>
        test one
      </div>
      <div>
        test two
      </div>
    </div>
  </div>;
}
