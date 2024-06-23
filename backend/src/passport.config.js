import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import  UserManager  from './DAO/DB/userManager.js';

passport.use(
    new LocalStrategy(async (email, password, done) =>{
        try{
            const user = await UserManager.getUserByCreds(email, password);
            if(!user){
                return done(null, false, {message: 'Correo electrónico o contraseña incorrectos'});
            }
            return done(null, user);
        }catch(error){
            return done(error);
        };
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done)=>{
    try{
        const user = await UserManager.getUserById(id);
        done(null, user);
    }catch(error){
        done(error);
    };
});

export default passport;