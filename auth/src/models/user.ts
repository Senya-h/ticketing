import mongoose from 'mongoose';
import { Password } from '../services/password';

interface UserAttrs {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    // doc - mongoose document which is being converted
    // ret - the plain object representation 
    // not exactly following MVC pattern here since we're directly affecting the view but should do
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
    }
  }
});

// TODO a hook
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }

  done();
})

userSchema.statics.build = (userAttrs: UserAttrs) => {
  const user = new User(userAttrs);
  return user;
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };

// const buildUser = (userAttrs: UserAttrs) => {
//   const user = new User(userAttrs);
//   return user;
// }

// export { User, buildUser };