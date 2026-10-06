import {RegisterForm} from '../components/user-form/RegisterForm'

export function Register(){
    return (
        <section className="public-register-page">
            <div className="container">
                <RegisterForm wideLayout />
            </div>
        </section>
    )
}