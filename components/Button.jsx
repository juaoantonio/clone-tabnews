export default function Button({children, onClick}) {

    return (<button style={{
        border: 'none',
        padding: '.8rem 2rem',
        fontSize: '1.5rem',
        cursor: 'pointer',
        borderRadius: '5px'
    }} onClick={onClick}>{children}</button>)
}