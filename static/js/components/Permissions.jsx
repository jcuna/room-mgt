/**
 * Created by Jon on 12/31/17.
 */
import Checkbox from "../utils/Checkbox";

export default class Permissions extends React.Component {

    constructor(props) {
        super();
        let role = '';
        let selectedPermissions = [];
        props.roles.assigned.forEach(item => {
            if (item.id === props.id) {
                role = item;
                if (item.permissions !== null) {
                    selectedPermissions = item.permissions
                }
            }
        });
        this.role = role;
        this.state = {
            selectedPermissions: selectedPermissions
        };
        this.selectCheckBox = this.selectCheckBox.bind(this);
    }

    render() {
        return <div className="permissions-container">
            <h3>{this.role.name}</h3>
            <div className="permissions right">
                <ul>
                    {Object.values(this.props.roles.permissions).map((item, i) => {
                    const hasStuff = this.state.selectedPermissions[item] !== undefined;
                    const allChecked = hasStuff && this.state.selectedPermissions[item].length === 3;
                    return (
                        <li key={i} className="endpoint">
                            <div className="half name">
                                <Checkbox name={item} label={item.split('.')[2]} checked={allChecked} onChange={this.selectCheckBox}/>
                            </div>
                            <div className="half">
                                <ul className="grant">
                                    {this.methods.map((obj, i) => <li className={obj.className} key={i}>
                                        <Checkbox name={item} id={obj.name} label={obj.nombre} checked={allChecked || hasStuff &&
                                        this.state.selectedPermissions[item].includes(obj.name)} onChange={this.selectCheckBox}/>
                                    </li>)}
                                </ul>
                            </div>
                        </li>)
                    })}
                </ul>
            </div>
        </div>
    }

    get methods() {
        return [
            {name: 'read', nombre: 'Leer', className: "chart down"},
            {name: 'write', nombre: 'Escribir', className: "chart line"},
            {name: 'delete', nombre: 'Borrar', className: "chart up"}
        ]
    }

    selectCheckBox(checkbox) {
        const checked = checkbox.checked;
        let name = checkbox.name;
        let type = checkbox.id || '*';

        if (this.state.selectedPermissions[name] === undefined) {
            this.setState({
                selectedPermissions: {[name]: []}
            });
        }

        if (checked) {
            if (type === "*") {
                let methods = [];
                this.methods.forEach(item => {
                    methods.push(item.name);
                });
                this.setState({
                    selectedPermissions: {...this.state.selectedPermissions, [name]: methods}
                });
            } else {
                let methods = [];
                if (this.state.selectedPermissions[name] !== undefined) {
                    methods = this.state.selectedPermissions[name].slice()
                }
                methods.push(type);
                this.setState({
                    selectedPermissions: {...this.state.selectedPermissions, [name]: methods}
                });
            }
        } else {
            if (type === "*") {
                let methods = {...this.state.selectedPermissions};
                delete methods[name];
                this.setState({
                    selectedPermissions: methods
                });
            } else {
                if (this.state.selectedPermissions[name].includes(type)) {
                    let items = this.state.selectedPermissions[name].slice();
                    items.splice(items.indexOf(type), 1);
                    this.setState({
                        selectedPermissions: {...this.state.selectedPermissions, [name]: items}
                    });
                }
            }
        }
    }

    componentWillUpdate(props, state, c) {
        this.props.onUpdate({id: this.props.id, permissions: state.selectedPermissions});
    }
}