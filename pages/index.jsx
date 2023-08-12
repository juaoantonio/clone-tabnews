import { useState } from 'react'
import Button from '../components/Button'

const messages = {
    samira: "Samira, meu amor, amo você, e se você me ama, dá uma risadinha",
    nicoly: "Minha Tchoguinha, meu bebêzinho, te amo ❤️",
    fernanda: "Mamãe do meu coração, amo a senhora, desculpa ser enjoado 🙃❤️",
    edgar: "Te amo, Pappiiii ❤️. (É uma bichooona)",
    rita: "Te amo, vózinha lindaaa ❤️",
    nazare: "Te amo, vózinha querida ❤️. Cadê a pimenta? 🙃",
}

function Home() {
    const [name, setName] = useState(null)

    const handleClick = (e) => {
        const name = e.currentTarget.innerText.toLowerCase()
        setName(name)
    }

    return <>
        <h1 style={{textAlign: 'center'}}>Quem é você?</h1>
        <div style={{
            display: "flex",
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '1rem',
            justifyContent: 'center'
        }}>
            <Button onClick={handleClick}>Fernanda</Button>
            <Button onClick={handleClick}>Nicoly</Button>
            <Button onClick={handleClick}>Samira</Button>
            <Button onClick={handleClick}>Edgar</Button>
            <Button onClick={handleClick}>Rita</Button>
            <Button onClick={handleClick}>Nazare</Button>
        </div>

        {name && <h2 style={{textAlign: 'center'}} >{messages[name]}</h2>}
        
    </>
}

export default Home